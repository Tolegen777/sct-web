/**
 * Админ-список записей на сервис (v2, по bookings_list_v2.html).
 *
 * Бэк отдаёт голый массив (без пагинации) — счётчики и фильтры считаем на
 * клиенте. Сверху hero-статкарточки (они же быстрые фильтры), под ними
 * поиск + тип услуги, далее таблица (desktop) / карточки (mobile).
 *
 * Поля — ПЛОСКИЕ (client_name, plate, car_title, service_title, station…),
 * status_label бэк не отдаёт — ярлык из STATUS_META.
 */
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStaffBookingsQuery } from '@/features/admin-bookings/queries'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import type { StaffBookingListRow } from '@/features/admin-bookings/types'

const STATUS_META: Record<string, { label: string; tone: string }> = {
  DRAFT: { label: 'Черновик', tone: 'bg-surfaceMuted text-textSecondary' },
  CREATED: { label: 'Новая', tone: 'bg-blue-50 text-brandBlue' },
  CONFIRMED: { label: 'Подтверждена', tone: 'bg-green-50 text-green-700' },
  IN_PROGRESS: { label: 'В работе', tone: 'bg-amber-50 text-amber-700' },
  COMPLETED: { label: 'Завершена', tone: 'bg-slate-100 text-slate-700' },
  CANCELLED_BY_CLIENT: { label: 'Отменена клиентом', tone: 'bg-rose-50 text-rose-700' },
  CANCELLED_BY_STAFF: { label: 'Отменена сотрудником', tone: 'bg-rose-50 text-rose-700' },
  NO_SHOW: { label: 'Не приехал', tone: 'bg-rose-50 text-rose-700' },
}

type Bucket = 'all' | 'new' | 'confirmed' | 'today' | 'no_time' | 'cancelled'

function isCancelled(s: string): boolean {
  return s === 'CANCELLED_BY_CLIENT' || s === 'CANCELLED_BY_STAFF'
}
function isActive(s: string): boolean {
  return !isCancelled(s) && s !== 'COMPLETED' && s !== 'NO_SHOW'
}
function isToday(iso?: string | null): boolean {
  if (!iso) return false
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return false
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}
function rowTimeIso(r: StaffBookingListRow): string | null {
  return r.scheduled_datetime ?? r.preferred_datetime ?? null
}

export default function AdminBookingsPage() {
  const { data, isLoading, isError, refetch } = useStaffBookingsQuery()
  const [bucket, setBucket] = useState<Bucket>('all')
  const [search, setSearch] = useState('')
  const [serviceType, setServiceType] = useState<string>('')

  const rows = useMemo(() => data ?? [], [data])

  const stats = useMemo(
    () => ({
      total: rows.length,
      new: rows.filter((r) => r.status === 'CREATED').length,
      confirmed: rows.filter((r) => r.status === 'CONFIRMED').length,
      today: rows.filter((r) => isToday(rowTimeIso(r))).length,
      no_time: rows.filter((r) => !r.scheduled_datetime && isActive(r.status)).length,
      cancelled: rows.filter((r) => isCancelled(r.status)).length,
    }),
    [rows],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (bucket === 'new' && r.status !== 'CREATED') return false
      if (bucket === 'confirmed' && r.status !== 'CONFIRMED') return false
      if (bucket === 'today' && !isToday(rowTimeIso(r))) return false
      if (bucket === 'no_time' && !(!r.scheduled_datetime && isActive(r.status))) return false
      if (bucket === 'cancelled' && !isCancelled(r.status)) return false
      if (serviceType && r.service_type !== serviceType) return false
      if (q) {
        const hay = [r.client_name, r.phone, r.plate, r.car_title, r.service_title]
          .map((v) => String(v ?? '').toLowerCase())
          .join(' ')
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, bucket, serviceType, search])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
          Записи на сервис
        </h1>
        <p className="mt-2 text-sm font-medium text-textSecondary">
          Управление записями клиентов: статус, дата и время, СТО, услуга, отмена.
        </p>
      </header>

      {/* Hero-статкарточки = быстрые фильтры */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Всего" value={stats.total} active={bucket === 'all'} onClick={() => setBucket('all')} tone="text-textPrimary" />
        <StatCard label="Новые" value={stats.new} active={bucket === 'new'} onClick={() => setBucket('new')} tone="text-brandBlue" />
        <StatCard label="Подтверждены" value={stats.confirmed} active={bucket === 'confirmed'} onClick={() => setBucket('confirmed')} tone="text-green-700" />
        <StatCard label="Сегодня" value={stats.today} active={bucket === 'today'} onClick={() => setBucket('today')} tone="text-indigo-600" />
        <StatCard label="Без времени" value={stats.no_time} active={bucket === 'no_time'} onClick={() => setBucket('no_time')} tone="text-amber-700" />
        <StatCard label="Отменены" value={stats.cancelled} active={bucket === 'cancelled'} onClick={() => setBucket('cancelled')} tone="text-rose-700" />
      </div>

      {/* Поиск + тип услуги */}
      <Card className="p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          <div className="md:col-span-2">
            <Input
              label="Поиск"
              placeholder="Имя клиента, госномер, телефон, услуга…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select label="Тип услуги" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            <option value="">Все типы</option>
            <option value="PACKAGE">Пакет</option>
            <option value="DEFAULT">Дефолтная услуга</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-sm font-bold text-red-700">Не удалось загрузить записи.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-900 uppercase tracking-widest text-textSecondary hover:border-brandBlue hover:text-brandBlue"
            >
              Повторить
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-textSecondary">
            По выбранным фильтрам записей нет.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surfaceLight text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                  <tr>
                    <th className="px-5 py-3">Заявка</th>
                    <th className="px-5 py-3">Клиент</th>
                    <th className="px-5 py-3">Автомобиль</th>
                    <th className="px-5 py-3">Услуга</th>
                    <th className="px-5 py-3">Цена</th>
                    <th className="px-5 py-3">Время</th>
                    <th className="px-5 py-3">СТО</th>
                    <th className="px-5 py-3">Создана</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {filtered.map((r) => (
                    <BookingRow key={r.id} r={r} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-borderLight md:hidden">
              {filtered.map((r) => (
                <BookingCardMobile key={r.id} r={r} />
              ))}
            </ul>
          </>
        )}
      </Card>
    </section>
  )
}

function StatCard({
  label,
  value,
  active,
  onClick,
  tone,
}: {
  label: string
  value: number
  active: boolean
  onClick: () => void
  tone: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-sct border bg-white p-4 text-left transition-all',
        active ? 'border-brandBlue shadow-soft-blue' : 'border-borderLight hover:border-brandBlue/40',
      )}
    >
      <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">{label}</p>
      <p className={cn('mt-1 text-2xl font-900 tracking-tight', tone)}>{value}</p>
    </button>
  )
}

function StatusPill({ status, label }: { status: string; label?: string | null }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-block rounded-md px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest',
        meta?.tone ?? 'bg-surfaceMuted text-textSecondary',
      )}
    >
      {label || meta?.label || status}
    </span>
  )
}

function priceText(r: StaffBookingListRow): string {
  if (r.price === null || r.price === undefined || r.price === '') return '—'
  return formatMoney(String(r.price), r.currency ?? 'KZT')
}

function timeCell(r: StaffBookingListRow): { text: string; muted: boolean } {
  const iso = rowTimeIso(r)
  if (!r.scheduled_datetime) {
    return { text: iso ? `${formatDateTime(iso)} · не подтв.` : 'Без времени', muted: true }
  }
  return { text: formatDateTime(r.scheduled_datetime), muted: false }
}

function BookingRow({ r }: { r: StaffBookingListRow }) {
  const navigate = useNavigate()
  const t = timeCell(r)
  return (
    <tr
      className="cursor-pointer hover:bg-surfaceLight/50"
      onClick={() => navigate(`/admin/bookings/${r.id}`)}
    >
      <td className="px-5 py-4">
        <p className="font-900 text-textPrimary">#{r.id}</p>
        <span className="mt-1 inline-block">
          <StatusPill status={r.status} label={r.status_label} />
        </span>
      </td>
      <td className="px-5 py-4">
        <p className="font-bold text-textPrimary">{r.client_name || '—'}</p>
        {r.phone && <p className="mt-0.5 font-mono text-[11px] text-textSecondary">{r.phone}</p>}
      </td>
      <td className="px-5 py-4">
        <p className="font-bold text-textPrimary">{r.car_title || '—'}</p>
        {r.plate && (
          <span className="mt-1 inline-block rounded bg-surfaceMuted px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-textSecondary">
            {r.plate}
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <p className="max-w-[260px] truncate font-bold text-textPrimary">{r.service_title || '—'}</p>
        <p className="mt-0.5 text-[10px] font-900 uppercase tracking-widest text-brandBlue">
          {r.service_type === 'DEFAULT' ? 'Дефолтная' : 'Пакет'}
        </p>
      </td>
      <td className="px-5 py-4 font-bold text-textPrimary">{priceText(r)}</td>
      <td className={cn('px-5 py-4', t.muted ? 'text-amber-700' : 'text-textPrimary')}>{t.text}</td>
      <td className="px-5 py-4 text-textPrimary">{r.station || 'Не выбрано'}</td>
      <td className="px-5 py-4 text-textSecondary">{r.created_at ? formatDateTime(r.created_at) : '—'}</td>
    </tr>
  )
}

function BookingCardMobile({ r }: { r: StaffBookingListRow }) {
  const t = timeCell(r)
  return (
    <li>
      <Link to={`/admin/bookings/${r.id}`} className="block p-4 transition-colors hover:bg-surfaceLight/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-900 text-textPrimary">
              #{r.id} <span className="font-bold text-textSecondary">· {r.client_name || '—'}</span>
            </p>
            <p className="mt-0.5 truncate text-[12px] font-bold text-textSecondary">
              {r.car_title || '—'}
              {r.plate && ` · ${r.plate}`}
            </p>
          </div>
          <StatusPill status={r.status} label={r.status_label} />
        </div>
        <p className="mt-2 truncate text-sm font-bold text-textPrimary">{r.service_title || '—'}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-textSecondary">
          <span className={t.muted ? 'text-amber-700' : 'text-brandBlue'}>{t.text}</span> · {priceText(r)}
        </p>
      </Link>
    </li>
  )
}
