/**
 * Упрощённая форма записи на сервис.
 *
 * Маршрут: `/services/:id/book`.
 *
 * Что есть в API сейчас:
 *   POST /service-book/create_booking/
 *   payload: { client_car_id, service_package_id, preferred_datetime, comment? }
 *
 * Чего ждём от бэка (после — апгрейдимся до полного 4-шагового flow):
 *   - GET /branches/                  → выбор филиала
 *   - GET /branches/{id}/slots/       → выбор временного слота
 *
 * Пока — простая форма: выбор машины из гаража + datetime-picker + комментарий.
 * Это покрывает 70% UX; недостающее (филиал и слот) добавим, как только
 * появятся эндпоинты.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePackageQuery } from '@/features/packages/queries'
import { useCarsQuery } from '@/features/garage/queries'
import { useCreateBookingMutation } from '@/features/bookings/queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { SafeImage } from '@/shared/ui/SafeImage'
import { parseApiError } from '@/features/auth/errors'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from '@/features/packages/lib'

/**
 * Schema формы. preferred_datetime: HTML `datetime-local` отдаёт строку
 * формата `YYYY-MM-DDTHH:mm` без таймзоны — преобразуем в ISO в submit.
 */
const bookingSchema = z.object({
  client_car_id: z
    .number({ message: 'Выберите автомобиль' })
    .int()
    .positive('Выберите автомобиль'),
  preferred_datetime: z
    .string()
    .min(1, 'Укажите дату и время')
    .refine((v) => !isNaN(new Date(v).getTime()), 'Некорректная дата')
    .refine((v) => new Date(v).getTime() > Date.now() - 60_000, 'Дата должна быть в будущем'),
  comment: z.string().max(1000, 'Не больше 1000 символов'),
})
type BookingFormValues = z.infer<typeof bookingSchema>

export default function BookServicePage() {
  const params = useParams<{ id: string }>()
  const packageId = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState<string | null>(null)

  const packageQuery = usePackageQuery(packageId)
  const carsQuery = useCarsQuery()
  const createMut = useCreateBookingMutation()

  // Если в URL есть ?car_id= — используем как дефолт (например, после клика
  // «Записаться» из сервисной книжки). Иначе — первая машина клиента.
  const defaultCarId = useMemo(() => {
    const fromUrl = Number(searchParams.get('car_id'))
    if (Number.isFinite(fromUrl) && fromUrl > 0) return fromUrl
    return undefined
  }, [searchParams])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      client_car_id: 0 as unknown as number,
      preferred_datetime: '',
      comment: '',
    },
  })

  // Подставляем активную/выбранную машину, когда гараж загрузится.
  useEffect(() => {
    if (!carsQuery.data) return
    if (defaultCarId && carsQuery.data.some((c) => c.id === defaultCarId)) {
      setValue('client_car_id', defaultCarId)
      return
    }
    const active = carsQuery.data.find((c) => c.is_default)
    if (active) setValue('client_car_id', active.id)
    else if (carsQuery.data[0]) setValue('client_car_id', carsQuery.data[0].id)
  }, [carsQuery.data, defaultCarId, setValue])

  if (packageQuery.isLoading || carsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (packageQuery.isError || !packageQuery.data) {
    return (
      <section className="container-sct py-12">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Пакет не найден.</p>
          <Link to="/services" className="mt-4 inline-block">
            <Button variant="ghost" size="sm">
              К услугам
            </Button>
          </Link>
        </Card>
      </section>
    )
  }

  // Если у клиента нет авто — призываем добавить.
  if (!carsQuery.data || carsQuery.data.length === 0) {
    return (
      <section className="container-sct py-12">
        <Card className="border-2 border-dashed border-borderLight p-10 text-center md:p-16">
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            Сначала добавьте авто
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium italic text-textSecondary">
            Чтобы записаться на сервис, в гараже должна быть хотя бы одна машина.
          </p>
          <Link to="/garage/add" className="mt-8 inline-block">
            <Button variant="dark" size="lg">
              Добавить авто
            </Button>
          </Link>
        </Card>
      </section>
    )
  }

  const pkg = packageQuery.data
  const shortTitle = getPackageShortTitle(pkg)

  const onSubmit = async (values: BookingFormValues) => {
    if (!packageId) return
    setServerError(null)
    try {
      // datetime-local отдаёт `2026-06-01T14:30` без таймзоны. Браузер парсит
      // как локальное время. toISOString() сконвертирует в UTC.
      const isoDatetime = new Date(values.preferred_datetime).toISOString()
      const booking = await createMut.mutateAsync({
        client_car_id: values.client_car_id,
        service_package_id: packageId,
        preferred_datetime: isoDatetime,
        comment: values.comment || undefined,
      })
      navigate(`/bookings/${booking.id}`, { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось создать запись.')
      // Маппинг серверных полей на форму. На бэке client_car_id →
      // у нас то же имя; preferred_datetime ↔ preferred_datetime.
      const fieldMap: Record<string, keyof BookingFormValues> = {
        client_car_id: 'client_car_id',
        service_package_id: 'client_car_id', // если упало на package — покажем над всем
        preferred_datetime: 'preferred_datetime',
        comment: 'comment',
      }
      for (const [field, message] of Object.entries(parsed.fields)) {
        const formField = fieldMap[field]
        if (formField) setError(formField, { type: 'server', message })
      }
      setServerError(parsed.general)
    }
  }

  // Min дата для datepicker — сейчас+30 минут (нельзя записаться на ровно сейчас).
  const nowPlus30 = new Date(Date.now() + 30 * 60_000)
  const minIso = toLocalDatetimeInputValue(nowPlus30)

  return (
    <section className="container-sct max-w-[920px] space-y-6 py-8 md:py-12">
      <Link
        to={`/services/${packageId}`}
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        К пакету
      </Link>

      <header>
        <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
          Запись на сервис
        </p>
        <h1 className="mt-2 text-3xl font-900 uppercase italic leading-tight tracking-tight text-textPrimary md:text-4xl">
          {shortTitle}
        </h1>
      </header>

      {/* Сводка пакета */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-stretch gap-5 p-5 md:p-6">
          <div className="hidden h-24 w-20 shrink-0 overflow-hidden rounded-sct border border-borderLight bg-surfaceLight md:block">
            <SafeImage
              src={pkg.image_url || undefined}
              alt={shortTitle}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-3xl">🛠️</div>
              }
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
              {pkg.category.name}
            </p>
            <p className="mt-1 text-sm font-bold uppercase italic tracking-tight text-textSecondary">
              {pkg.car_title}
            </p>
            {pkg.short_description && (
              <p className="mt-2 text-sm font-medium italic text-textSecondary line-clamp-2">
                {pkg.short_description}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
              Цена
            </p>
            <p className="mt-1 text-2xl font-900 italic leading-none tracking-tighter text-brandBlue md:text-3xl">
              {formatMoney(pkg.final_price, pkg.currency)}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Card className="space-y-5 p-5 md:p-6">
          <h3 className="text-base font-900 uppercase italic tracking-tight text-textPrimary">
            Параметры визита
          </h3>

          {carsQuery.data.length > 1 ? (
            <Select
              label="Автомобиль *"
              {...register('client_car_id', { valueAsNumber: true })}
              error={errors.client_car_id?.message}
            >
              <option value={0}>— выберите —</option>
              {carsQuery.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nickname || c.display_name}
                  {c.license_plate ? ` · ${c.license_plate}` : ''}
                  {c.is_default ? ' (активное)' : ''}
                </option>
              ))}
            </Select>
          ) : (
            <div>
              <p className="mb-2 text-[11px] font-800 uppercase tracking-widest text-textSecondary">
                Автомобиль
              </p>
              <div className="rounded-sct border border-borderLight bg-surfaceLight px-4 py-3 text-sm font-bold text-textPrimary">
                {carsQuery.data[0].nickname || carsQuery.data[0].display_name}
                {carsQuery.data[0].license_plate && (
                  <span className="ml-2 font-mono text-xs text-textSecondary">
                    {carsQuery.data[0].license_plate}
                  </span>
                )}
              </div>
              <input
                type="hidden"
                {...register('client_car_id', { valueAsNumber: true })}
                value={carsQuery.data[0].id}
              />
            </div>
          )}

          <Input
            type="datetime-local"
            label="Желаемые дата и время *"
            min={minIso}
            hint="Точное время мастер подтвердит после рассмотрения заявки."
            {...register('preferred_datetime')}
            error={errors.preferred_datetime?.message}
          />

          <Textarea
            label="Комментарий"
            rows={3}
            placeholder="Например: проверить шум подвески, подготовить расходники заранее."
            {...register('comment')}
            error={errors.comment?.message}
          />
        </Card>

        <Card className="bg-blue-50 border-blue-100 p-5">
          <p className="text-[11px] font-bold italic leading-relaxed text-brandBlueDark">
            ℹ️ Сейчас доступна предварительная запись. Выбор филиала и точного слота
            появится после готовности соответствующих эндпоинтов на бэке. Мастер
            свяжется с вами для подтверждения времени.
          </p>
        </Card>

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-end">
          <Link to={`/services/${packageId}`}>
            <Button type="button" variant="ghost" disabled={isSubmitting || createMut.isPending}>
              Отмена
            </Button>
          </Link>
          <Button type="submit" loading={isSubmitting || createMut.isPending}>
            Записаться
          </Button>
        </div>
      </form>

      <p className="text-center text-[10px] font-medium italic text-textSecondary/60">
        Нажимая «Записаться», вы соглашаетесь с правилами обслуживания SCT Service.
      </p>
    </section>
  )
}

/**
 * Формат для HTML `datetime-local`: `YYYY-MM-DDTHH:mm` в локальной таймзоне
 * (browser local time). `Date.toISOString()` сюда не подходит — он в UTC.
 */
function toLocalDatetimeInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes())
  )
}
