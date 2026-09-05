/**
 * Редактирование авто клиента.
 *
 * Редактируемые поля — ГОСНОМЕР и ФАКТИЧЕСКИЙ ГОД ВЫПУСКА.
 *
 * Год (`production_year`) — правка заказчика от 01.09: «вместо слова псевдоним
 * напишем фактический год автомобиля, чтобы просто была циферка». Псевдоним из
 * формы убран — им никто не пользовался, а поле занимало единственный слот.
 *
 * Госномер (`license_plate`) — правка от 05.09, шеф просил лично: «если я
 * завтра повешу на эту же машину другой номер, я должен мочь его тут
 * отредактировать». Проверка та же, что при добавлении авто (казахстанский
 * формат с регионом), значение нормализуется перед отправкой.
 * Год выводится рядом с госномером в такой же чёрной рамке (см. PlateBadge).
 * Бэк валидирует год по границам поколения: для BMW 02 (E10) примет только
 * 1966–1977, иначе вернёт 400 с текстом под полем. Это ожидаемо.
 *
 * Пробег из формы убран раньше (2026-08-29): его проставляет сервис при
 * обслуживании, и от него считаются рекомендации — клиент не должен его
 * трогать. Текущее значение видно в сводке сверху, только для чтения. VIN и
 * сама модификация остаются readonly: чтобы сменить модификацию, клиент
 * удаляет авто и добавляет заново через конфигуратор.
 *
 * Сверху — CarSummaryCard: тот же модуль, что на «Главной» (большое фото,
 * название, номер, год, пробег/замена масла/ближайший визит), но без кнопки
 * «Записаться на сервис» — правка заказчика от 05.09.
 *
 * Дополнительно — действия:
 *   - «Сделать активным» (если не is_default)
 *   - «Удалить» с предупреждением (hard delete вместе с историей)
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useCarQuery,
  useDeleteCarMutation,
  useSetDefaultCarMutation,
  useUpdateCarMutation,
} from '@/features/garage/queries'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { Spinner } from '@/shared/ui/Spinner'
import { parseApiError } from '@/features/auth/errors'
import {
  LICENSE_PLATE_ERROR,
  isValidLicensePlate,
  normalizeLicensePlate,
} from '@/shared/lib/license-plate'
import { getCarProductionYear } from '@/features/garage/lib'
import { CarSummaryCard } from '@/features/garage/CarSummaryCard'

const editSchema = z.object({
  // Формат госномера проверяем НЕ здесь, а в onSubmit и только если поле
  // трогали: у машин, заведённых до 29.08.2026, в базе лежат огрызки вроде
  // «577AXG» без региона, и строгая схема не давала бы такому владельцу
  // сохранить даже год, пока он не перепишет номер.
  license_plate: z.string().min(1, 'Введите госномер'),
  // Год необязателен: у большинства машин `production_year` пустой, и
  // требовать его ради правки одного госномера нельзя.
  production_year: z
    .number({ message: 'Введите год числом' })
    .int('Только целое число')
    .min(1900, 'Слишком ранний год')
    .max(new Date().getFullYear() + 1, 'Слишком поздний год')
    .optional(),
})
type EditValues = z.infer<typeof editSchema>

export default function EditCarPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()

  const { data: car, isLoading, isError } = useCarQuery(id)
  const updateMut = useUpdateCarMutation(id ?? 0)
  const setDefaultMut = useSetDefaultCarMutation()
  const deleteMut = useDeleteCarMutation()

  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  // Флаг «только что сохранили» — раньше здесь лежал Date.now(), но само
  // значение времени нигде не использовалось (только truthy-проверка), а
  // правило react-hooks/purity ругалось на вызов Date.now в теле компонента.
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, dirtyFields },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { license_plate: '', production_year: undefined },
  })

  // Подставляем серверные значения, когда машина прогрузится.
  useEffect(() => {
    if (car) {
      reset({
        license_plate: car.license_plate ?? '',
        production_year: getCarProductionYear(car) ?? undefined,
      })
    }
  }, [car, reset])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !car || !id) {
    return (
      <section className="container-sct py-12">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Не удалось загрузить автомобиль.</p>
          <Link to="/garage" className="mt-4 inline-block">
            <Button variant="ghost" size="sm">
              К гаражу
            </Button>
          </Link>
        </Card>
      </section>
    )
  }


  const onSubmit = async (values: EditValues) => {
    setServerError(null)
    try {
      // Шлём ТОЛЬКО реально изменённые поля — не тревожим бэк лишними.
      // openapi-typescript делает is_default обязательным в типе из-за
      // `default: false` в схеме, хотя PATCH partial. Передаём текущее
      // значение (поведение не меняется) — так обходимся без каста.
      // production_year бэк принимает и валидирует, но в сгенерированной
      // schema.ts поля ещё нет — она отстала, поэтому расширяем тип вручную.
      const payload = {
        is_default: car.is_default,
      } as Parameters<typeof updateMut.mutateAsync>[0] & { production_year?: number }
      if (dirtyFields.license_plate) {
        if (!isValidLicensePlate(values.license_plate)) {
          setError('license_plate', { type: 'validate', message: LICENSE_PLATE_ERROR })
          return
        }
        payload.license_plate = normalizeLicensePlate(values.license_plate)
      }
      if (dirtyFields.production_year && values.production_year != null) {
        payload.production_year = values.production_year
      }

      await updateMut.mutateAsync(payload)
      setSaved(true)
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось сохранить изменения.')
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'production_year' || field === 'license_plate') {
          setError(field, { type: 'server', message })
        }
      }
      setServerError(parsed.general)
    }
  }

  const onSetDefault = () => {
    if (car.is_default) return
    setDefaultMut.mutate(id, {
      onSuccess: () => setSaved(true),
      onError: (err) =>
        setServerError(
          parseApiError(err, 'Не удалось сделать авто активным.').general,
        ),
    })
  }

  const onDelete = () => {
    deleteMut.mutate(id, {
      onSuccess: () => navigate('/garage', { replace: true }),
      onError: (err) => {
        setConfirmDelete(false)
        setServerError(parseApiError(err, 'Не удалось удалить авто.').general)
      },
    })
  }

  return (
    <section className="container-sct max-w-[900px] space-y-6 py-8 md:py-12">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {/* Ссылка «‹ К гаражу» убрана по правке заказчика. Уйти со страницы
              есть чем: кнопка «Отмена» под формой, пункт «Гараж» в меню
              пользователя и кнопка «назад» браузера. В ветке «не удалось
              загрузить авто» ссылка остаётся — там она единственный выход. */}
          <h1 className="text-3xl font-900 uppercase tracking-tight text-textPrimary md:text-4xl">
            Редактирование авто
          </h1>
        </div>
        {car.is_default && (
          <span className="inline-flex items-center gap-2 self-start rounded-lg bg-brandBlue px-3 py-1.5 text-[11px] font-900 uppercase tracking-widest text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brandYellow" />
            Активное авто
          </span>
        )}
      </header>

      {/* Сводка по авто — модуль с «Главной» без кнопки записи (правка 05.09). */}
      <CarSummaryCard car={car} />

      {/* Форма редактирования */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-5 p-5 md:p-6">
          <h3 className="text-base font-900 uppercase tracking-tight text-textPrimary">
            Редактируемые поля
          </h3>

          <Input
            label="Госномер"
            placeholder="123ABC02"
            hint="Как в техпаспорте, вместе с регионом."
            {...register('license_plate')}
            error={errors.license_plate?.message}
          />

          <Input
            label="Фактический год автомобиля"
            placeholder="2019"
            inputMode="numeric"
            maxLength={4}
            hint="Год выпуска именно вашего автомобиля — показывается рядом с госномером."
            {...register('production_year', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
            error={errors.production_year?.message}
          />

          {serverError && (
            <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {serverError}
            </div>
          )}

          {saved && !isDirty && !serverError && (
            <div className="rounded-sct border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
              Изменения сохранены.
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            {/* «Отмена» возвращает туда, откуда пришли (главная, «Авто»,
                гараж), а не всегда в гараж: в редактирование попадают кликом по
                карточке авто с разных экранов, и уводить человека в гараж —
                значит терять его место. Прямой заход по ссылке (истории нет) —
                фолбэк на гараж. `idx` в history.state проставляет react-router. */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
                if (idx > 0) navigate(-1)
                else navigate('/garage')
              }}
            >
              Отмена
            </Button>
            <Button type="submit" loading={isSubmitting || updateMut.isPending} disabled={!isDirty}>
              Сохранить
            </Button>
          </div>
        </Card>
      </form>

      {/* Дополнительные действия */}
      <Card className="space-y-4 p-5 md:p-6">
        <h3 className="text-base font-900 uppercase tracking-tight text-textPrimary">
          Действия
        </h3>

        {!car.is_default && (
          <div className="flex flex-col items-start justify-between gap-3 rounded-sct border border-borderLight bg-surfaceLight p-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-textPrimary">Сделать авто активным</p>
              <p className="text-xs text-textSecondary">
                Услуги и сервисная книжка будут подбираться под эту машину.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSetDefault}
              loading={setDefaultMut.isPending}
            >
              Сделать активной
            </Button>
          </div>
        )}

        <div className="flex flex-col items-start justify-between gap-3 rounded-sct border border-red-100 bg-red-50/40 p-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold text-red-700">Удалить автомобиль</p>
            <p className="text-xs text-textSecondary">
              История обслуживания и записи будут удалены безвозвратно.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Удалить
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Удалить автомобиль?"
        disableOverlayClose={deleteMut.isPending}
      >
        <p className="text-sm text-textSecondary">
          Будут удалены: история обслуживания, выполненные визиты и активные записи.
          Действие необратимо.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setConfirmDelete(false)}
            disabled={deleteMut.isPending}
          >
            Отмена
          </Button>
          <Button variant="danger" fullWidth onClick={onDelete} loading={deleteMut.isPending}>
            Удалить
          </Button>
        </div>
      </Modal>
    </section>
  )
}
