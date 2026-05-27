/**
 * Детальная карточка записи на сервис.
 *
 * Маршрут: `/bookings/:id`. Сюда переходим из сервисной книжки.
 *
 * Бэк отдаёт богатую структуру через GET /service-book/bookings/{id}/:
 *   - статус и статус-label
 *   - 3 даты (preferred, scheduled, final)
 *   - snapshot полей (название пакета, авто, госномер)
 *   - объект car, service_package_data, service_station_data (опц.)
 *   - permissions: can_edit, can_cancel
 *
 * Действия:
 *   - «Изменить» → EditBookingModal (PATCH /bookings/{id}/) — РАБОТАЕТ
 *   - «Отменить» → пока заглушка (бэк не подключил cancel-эндпоинт)
 *
 * Когда бэк добавит cancel — заменим alert на нормальный confirm + mutate.
 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBookingQuery } from '@/features/bookings/queries'
import { EditBookingModal } from '@/features/bookings/EditBookingModal'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { toast } from '@/shared/ui/Toast'
import { formatDateTime, formatMileage } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import type { BookingStatus } from '@/features/bookings/types'

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useBookingQuery(id)
  const [editOpen, setEditOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <section className="container-sct py-12">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Запись не найдена или недоступна.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Повторить
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/service-book')}>
              К сервисной книжке
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  const datetime =
    data.final_datetime ?? data.scheduled_datetime ?? data.preferred_datetime
  const priceDisplay = data.service_package_data.price.display || data.price.display

  return (
    <section className="container-sct max-w-[920px] space-y-6 py-8 md:py-12">
      <Link
        to="/service-book"
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        К сервисной книжке
      </Link>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={data.status} label={data.status_label} />
            <span className="font-mono text-xs text-textSecondary">Запись #{data.id}</span>
          </div>
          <h1 className="mt-3 text-3xl font-900 uppercase italic leading-tight tracking-tight text-textPrimary md:text-4xl">
            {data.service_package_data.title}
          </h1>
        </div>
      </header>

      {/* Главные данные визита */}
      <Card className="p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <Field
            label="Дата и время"
            value={datetime ? formatDateTime(datetime) : '—'}
            accent="primary"
          />
          <Field
            label="Стоимость"
            value={priceDisplay || '—'}
            accent="primary"
          />
          {data.current_mileage_km != null && data.current_mileage_km > 0 && (
            <Field
              label="Пробег на момент записи"
              value={formatMileage(data.current_mileage_km)}
            />
          )}
        </div>
      </Card>

      {/* Авто */}
      <Card className="bg-surfaceLight/40 p-6">
        <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
          Автомобиль
        </p>
        <h3 className="mt-2 text-xl font-900 uppercase italic tracking-tighter text-textPrimary md:text-2xl">
          {data.car.nickname || data.car.title}
        </h3>
        <p className="mt-1 text-sm font-bold uppercase italic tracking-tight text-textSecondary">
          {data.car.full_title}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {data.car.license_plate && (
            <span className="rounded-lg bg-textPrimary px-3 py-1 font-mono text-[12px] font-900 uppercase tracking-widest text-white">
              {data.car.license_plate}
            </span>
          )}
          {data.car.vin_code && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-textSecondary">
              VIN: {data.car.vin_code}
            </span>
          )}
        </div>
      </Card>

      {/* Описание пакета */}
      <Card className="p-6">
        <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
          О пакете
        </p>
        {data.service_package_data.short_description && (
          <p className="mt-2 text-sm font-medium italic leading-relaxed text-textSecondary">
            {data.service_package_data.short_description}
          </p>
        )}
        {data.service_package_data.description && (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-textPrimary">
            {data.service_package_data.description}
          </p>
        )}
        <Link
          to={`/services/${data.service_package_data.id}`}
          className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brandBlue hover:underline"
        >
          Подробнее о пакете →
        </Link>
      </Card>

      {/* Комментарии */}
      {(data.comment || data.staff_comment) && (
        <Card className="space-y-4 p-6">
          {data.comment && (
            <div>
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Ваш комментарий
              </p>
              <p className="mt-2 whitespace-pre-line rounded-sct border border-borderLight bg-surfaceLight p-4 text-sm italic text-textPrimary">
                {data.comment}
              </p>
            </div>
          )}
          {data.staff_comment && (
            <div>
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Комментарий мастера
              </p>
              <p className="mt-2 whitespace-pre-line rounded-sct border border-blue-100 bg-blue-50/40 p-4 text-sm italic text-textPrimary">
                {data.staff_comment}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Действия */}
      <Card className="p-6">
        <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
          Действия
        </p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:flex-wrap">
          <Button
            variant="secondary"
            disabled={!data.permissions.can_edit || data.status === 'CANCELLED'}
            title={
              data.permissions.can_edit
                ? 'Изменить филиал, дату или комментарий'
                : 'Изменение недоступно'
            }
            onClick={() => setEditOpen(true)}
          >
            Изменить
          </Button>
          <Button
            variant="danger"
            disabled={!data.permissions.can_cancel || data.status === 'CANCELLED'}
            title={
              data.permissions.can_cancel
                ? 'Отменить визит'
                : 'Отмена пока недоступна'
            }
            onClick={() => {
              toast.warning(
                'Отмена записи пока недоступна — бэкенд ещё не подключил эндпоинт.',
              )
            }}
          >
            Отменить
          </Button>
        </div>
        <p className="mt-3 text-[10px] font-medium italic text-textSecondary/70">
          Отмена пока недоступна — бэкенд ещё не подключил соответствующий
          эндпоинт. Редактирование уже работает.
        </p>
      </Card>

      <EditBookingModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        booking={data}
      />

      {/* Служебные */}
      <Card className="bg-surfaceLight p-5 text-[11px] font-bold text-textSecondary">
        <ServiceRow label="Создано" value={formatDateTime(data.created_at)} />
        <ServiceRow label="Обновлено" value={formatDateTime(data.updated_at)} />
        {data.scheduled_datetime && data.scheduled_datetime !== data.preferred_datetime && (
          <ServiceRow
            label="Подтверждено на"
            value={formatDateTime(data.scheduled_datetime)}
          />
        )}
        {data.cancel_reason && (
          <ServiceRow label="Причина отмены" value={data.cancel_reason} />
        )}
      </Card>
    </section>
  )
}

function Field({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'primary'
}) {
  return (
    <div>
      <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
        {label}
      </p>
      <p
        className={cn(
          'mt-2 text-xl font-900 italic leading-none tracking-tighter md:text-2xl',
          accent === 'primary' ? 'text-brandBlue' : 'text-textPrimary',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function ServiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="uppercase tracking-tighter text-textSecondary/70">{label}</span>
      <span className="text-textPrimary">{value || '—'}</span>
    </div>
  )
}

function StatusBadge({ status, label }: { status: BookingStatus; label: string }) {
  const cls =
    status === 'CREATED'
      ? 'bg-blue-50 text-brandBlue border-blue-100'
      : status === 'CONFIRMED'
      ? 'bg-green-50 text-green-700 border-green-100'
      : status === 'IN_PROGRESS'
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : status === 'COMPLETED'
      ? 'bg-surfaceMuted text-textSecondary border-borderLight'
      : status === 'CANCELLED'
      ? 'bg-red-50 text-red-700 border-red-100'
      : 'bg-surfaceLight text-textSecondary border-borderLight'
  return (
    <span
      className={cn(
        'inline-block rounded-full border px-3 py-1 text-[10px] font-900 uppercase tracking-widest',
        cls,
      )}
    >
      {label}
    </span>
  )
}
