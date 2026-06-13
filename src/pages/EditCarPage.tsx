/**
 * Редактирование авто клиента.
 *
 * Через PATCH /garage/cars/{id}/ можно менять только nickname и mileage_km —
 * это подтвердил бэк. Госномер, VIN и сама модификация — readonly: чтобы
 * сменить модификацию, клиент удаляет авто и добавляет заново через
 * полный конфигуратор.
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
import { SafeImage } from '@/shared/ui/SafeImage'
import { parseApiError } from '@/features/auth/errors'
import { formatMileage } from '@/shared/lib/format'
import { getCarPhoto, getCarSubtitle, getCarTitle } from '@/features/garage/lib'

const editSchema = z.object({
  nickname: z
    .string()
    .trim()
    .max(255, 'Не больше 255 символов'),
  mileage_km: z
    .number({ message: 'Введите пробег числом' })
    .int('Целое число')
    .min(0, 'Пробег не может быть отрицательным')
    .max(9_999_999, 'Слишком большое значение'),
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
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { nickname: '', mileage_km: 0 },
  })

  // Подставляем серверные значения, когда машина прогрузится.
  useEffect(() => {
    if (car) {
      reset({
        nickname: car.nickname ?? '',
        mileage_km: car.latest_mileage_km ?? 0,
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

  const photo = getCarPhoto(car)
  const title = getCarTitle(car)
  const subtitle = getCarSubtitle(car)

  const onSubmit = async (values: EditValues) => {
    setServerError(null)
    try {
      // openapi-typescript делает is_default обязательным в типе из-за
      // `default: false` в схеме, хотя PATCH partial. Передаём текущее
      // значение (поведение не меняется) — так обходимся без каста.
      await updateMut.mutateAsync({
        nickname: values.nickname,
        mileage_km: values.mileage_km,
        is_default: car.is_default,
      })
      setSavedAt(Date.now())
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось сохранить изменения.')
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'nickname' || field === 'mileage_km') {
          setError(field, { type: 'server', message })
        }
      }
      setServerError(parsed.general)
    }
  }

  const onSetDefault = () => {
    if (car.is_default) return
    setDefaultMut.mutate(id, {
      onSuccess: () => setSavedAt(Date.now()),
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
          <Link
            to="/garage"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            К гаражу
          </Link>
          <h1 className="mt-3 text-3xl font-900 uppercase tracking-tight text-textPrimary md:text-4xl">
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

      {/* Hero авто */}
      <Card className="p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-sct-lg border border-borderLight bg-surfaceLight md:h-32 md:w-32">
            <SafeImage
              src={photo ?? undefined}
              alt={title}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-2xl font-900 uppercase text-borderLight">
                  {title.slice(0, 2)}
                </div>
              }
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm font-bold uppercase tracking-tight text-textSecondary">
              {subtitle}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-textPrimary px-3 py-1 font-mono text-[12px] font-900 uppercase text-white">
                {car.license_plate || '—'}
              </span>
              {car.vin_code && (
                <span className="font-mono text-[10px] uppercase tracking-widest text-textSecondary">
                  VIN: {car.vin_code}
                </span>
              )}
              {typeof car.latest_mileage_km === 'number' && car.latest_mileage_km > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                  Пробег: {formatMileage(car.latest_mileage_km)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Форма редактирования */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-5 p-5 md:p-6">
          <h3 className="text-base font-900 uppercase tracking-tight text-textPrimary">
            Редактируемые поля
          </h3>

          <Input
            label="Псевдоним"
            placeholder="Например: моя машина"
            hint="Удобное имя для гаража. Не обязательно."
            {...register('nickname')}
            error={errors.nickname?.message}
          />

          <Input
            type="number"
            inputMode="numeric"
            label="Текущий пробег, км *"
            placeholder="84200"
            hint="Сохраняется в историю пробега. На основании пробега считаются рекомендации сервиса."
            {...register('mileage_km', { valueAsNumber: true })}
            error={errors.mileage_km?.message}
          />

          {serverError && (
            <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {serverError}
            </div>
          )}

          {savedAt && !isDirty && !serverError && (
            <div className="rounded-sct border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
              Изменения сохранены.
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <Link to="/garage">
              <Button type="button" variant="ghost">
                Отмена
              </Button>
            </Link>
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
