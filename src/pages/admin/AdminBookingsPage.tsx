/**
 * Админ-список записей на сервис (по bookings_list.html).
 *
 * Шапка с заголовком, фильтры (статус + поиск), таблица с ключевыми
 * колонками (Клиент / Авто / Услуга / Дата / Статус / Действие). Клик
 * по строке или «Открыть» → детальная.
 *
 * Пагинация через ?page=&page_size=.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStaffBookingsQuery } from '@/features/admin-bookings/queries'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import type { BookingStatus, StaffBooking } from '@/features/admin-bookings/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Все статусы' },
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'CREATED', label: 'Создана' },
  { value: 'CONFIRMED', label: 'Подтверждена' },
  { value: 'IN_PROGRESS', label: 'В работе' },
  { value: 'COMPLETED', label: 'Завершена' },
  { value: 'CANCELLED_BY_CLIENT', label: 'Отменена клиентом' },
  { value: 'CANCELLED_BY_STAFF', label: 'Отменена сотрудником' },
  { value: 'NO_SHOW', label: 'Клиент не приехал' },
]

const STATUS_TONE: Record<string, string> = {
  DRAFT: 'bg-surfaceMuted text-textSecondary',
  CREATED: 'bg-blue-50 text-brandBlue',
  CONFIRMED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED_BY_CLIENT: 'bg-red-50 text-red-700',
  CANCELLED_BY_STAFF: 'bg-red-50 text-red-700',
  NO_SHOW: 'bg-red-50 text-red-700',
}

const PAGE_SIZE = 20

export default function AdminBookingsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')

  const { data, isLoading, isError } = useStaffBookingsQuery({
    page,
    page_size: PAGE_SIZE,
    search: search.trim() || undefined,
    status: (status as BookingStatus) || undefined,
  })

  const items = data?.results ?? []
  const total = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
            Записи на сервис
          </h1>
          <p className="mt-2 text-sm font-medium text-textSecondary">
            Управление записями клиентов: смена статуса, переноc, отмена, заметки.
          </p>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-textSecondary">
          Всего записей: <span className="text-textPrimary">{total}</span>
        </p>
      </header>

      <Card className="p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <Input
            label="Поиск"
            placeholder="Имя клиента, госномер, телефон…"
            value={search}
            onChange={(e) => {
              setPage(1)
              setSearch(e.target.value)
            }}
          />
          <Select
            label="Статус"
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm font-bold text-red-700">
            Не удалось загрузить записи.
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-textSecondary">
            По выбранным фильтрам записей нет.
          </div>
        ) : (
          <>
            {/* Desktop: таблица; Mobile: карточки */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surfaceLight text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                  <tr>
                    <th className="px-5 py-3">Клиент</th>
                    <th className="px-5 py-3">Авто</th>
                    <th className="px-5 py-3">Услуга</th>
                    <th className="px-5 py-3">Дата</th>
                    <th className="px-5 py-3">Статус</th>
                    <th className="px-5 py-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {items.map((b) => (
                    <BookingRow key={b.id} booking={b} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-borderLight md:hidden">
              {items.map((b) => (
                <BookingCardMobile key={b.id} booking={b} />
              ))}
            </ul>
          </>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-textSecondary hover:border-brandBlue hover:text-brandBlue disabled:opacity-40"
          >
            ← Назад
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-textSecondary">
            Стр. {page} из {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-textSecondary hover:border-brandBlue hover:text-brandBlue disabled:opacity-40"
          >
            Вперёд →
          </button>
        </div>
      )}
    </section>
  )
}

function StatusPill({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-block rounded-md px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest',
        STATUS_TONE[status] ?? 'bg-surfaceMuted text-textSecondary',
      )}
    >
      {label || status}
    </span>
  )
}

function bookingDate(b: StaffBooking): string {
  const iso = b.final_datetime ?? b.scheduled_datetime ?? b.preferred_datetime
  return iso ? formatDateTime(iso) : 'Не указана'
}

function clientName(b: StaffBooking): string {
  return b.client?.full_name || b.client?.phone || '—'
}

function carTitle(b: StaffBooking): string {
  return b.car_title_snapshot || (b.car as { title?: string } | undefined)?.title || '—'
}

function bookingPrice(b: StaffBooking): string {
  const price = b.price as { display?: string; final?: string; currency?: string } | undefined
  if (price?.display) return price.display
  const pkg = b.service_package_data as { final_price?: string; currency?: string } | undefined
  if (pkg?.final_price) return formatMoney(pkg.final_price, pkg.currency)
  return '—'
}

function BookingRow({ booking }: { booking: StaffBooking }) {
  return (
    <tr className="hover:bg-surfaceLight/50">
      <td className="px-5 py-4">
        <p className="font-bold text-textPrimary">{clientName(booking)}</p>
        {booking.client?.phone && (
          <p className="mt-0.5 font-mono text-[11px] text-textSecondary">
            {booking.client.phone}
          </p>
        )}
      </td>
      <td className="px-5 py-4">
        <p className="font-bold text-textPrimary">{carTitle(booking)}</p>
        {booking.license_plate_snapshot && (
          <span className="mt-1 inline-block rounded bg-surfaceMuted px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-textSecondary">
            {booking.license_plate_snapshot}
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <p className="font-bold text-textPrimary">
          {booking.service_package_title_snapshot || '—'}
        </p>
        <p className="mt-0.5 text-[11px] font-bold text-brandBlue">
          {bookingPrice(booking)}
        </p>
      </td>
      <td className="px-5 py-4 text-textPrimary">{bookingDate(booking)}</td>
      <td className="px-5 py-4">
        <StatusPill status={booking.status} label={booking.status_label} />
      </td>
      <td className="px-5 py-4 text-right">
        <Link
          to={`/admin/bookings/${booking.id}`}
          className="inline-block rounded-md bg-brandBlue px-3 py-1.5 text-[10px] font-900 uppercase tracking-widest text-white hover:bg-brandBlueDark"
        >
          Открыть
        </Link>
      </td>
    </tr>
  )
}

function BookingCardMobile({ booking }: { booking: StaffBooking }) {
  return (
    <li>
      <Link
        to={`/admin/bookings/${booking.id}`}
        className="block p-4 transition-colors hover:bg-surfaceLight/60"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-textPrimary">{clientName(booking)}</p>
            <p className="mt-0.5 truncate text-[12px] font-bold text-textSecondary">
              {carTitle(booking)}
              {booking.license_plate_snapshot && ` · ${booking.license_plate_snapshot}`}
            </p>
          </div>
          <StatusPill status={booking.status} label={booking.status_label} />
        </div>
        <p className="mt-2 truncate text-sm font-bold text-textPrimary">
          {booking.service_package_title_snapshot || '—'}
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-textSecondary">
          {bookingDate(booking)} · <span className="text-brandBlue">{bookingPrice(booking)}</span>
        </p>
      </Link>
    </li>
  )
}
