/**
 * Секция «Предстоящие визиты» на главной.
 *
 * Берёт данные из `service-book/page-data` (общий запрос с ActiveCarBlock).
 * Показывает: ближайший визит + до 2 запланированных. Каждая карточка с
 * кнопками «Перенести» (=открыть EditBookingModal) и «Детали».
 *
 * Если активных визитов нет — не рендерим (на главной не нужна пустая
 * секция «История пуста», она будет ниже).
 */
import { Link } from 'react-router-dom'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'
import type { Appointment } from '@/features/service-book/types'

export function UpcomingVisitsSection() {
  const { data } = useServiceBookQuery({ status: 'active', period: 'upcoming', limit: 5, offset: 0 })
  if (!data) return null

  const upcoming = data.appointments.filter((a) => a.is_active && !a.is_cancelled)
  const all = data.next_appointment
    ? [data.next_appointment, ...upcoming.filter((a) => a.id !== data.next_appointment?.id)]
    : upcoming
  const items = all.slice(0, 3)

  if (items.length === 0) return null

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-3 md:mb-5">
        <div>
          <h2 className="text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
            Предстоящие визиты
          </h2>
          <p className="mt-1 text-[12px] font-medium italic text-textSecondary">
            Ваши активные записи на обслуживание
          </p>
        </div>
        <Link
          to="/service-book"
          className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Новая запись →
        </Link>
      </header>

      <div className="space-y-3">
        {items.map((a, idx) => (
          <VisitRow key={a.id} appointment={a} highlighted={idx === 0} />
        ))}
      </div>
    </section>
  )
}

function VisitRow({
  appointment,
  highlighted,
}: {
  appointment: Appointment
  highlighted: boolean
}) {
  const datetime =
    appointment.final_datetime ?? appointment.scheduled_datetime ?? appointment.preferred_datetime

  return (
    <Card
      className={cn(
        'flex flex-col items-stretch gap-3 p-4 md:flex-row md:items-center md:gap-5 md:p-5',
        highlighted && 'border-brandBlue/30 bg-blue-50/30',
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brandBlue text-white">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        {highlighted && (
          <span className="mb-1 inline-flex items-center gap-1.5 rounded-md bg-brandBlue px-2 py-0.5 text-[9px] font-900 uppercase tracking-widest text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brandYellow" />
            Ближайший визит
          </span>
        )}
        <p className="truncate text-sm font-900 uppercase italic tracking-tight text-textPrimary md:text-base">
          {appointment.service_package.title}
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-textSecondary">
          {datetime ? formatDateTime(datetime) : '—'}
          {appointment.car.title && <> · {appointment.car.title}</>}
        </p>
      </div>

      <div className="flex gap-2">
        <Link
          to={`/bookings/${appointment.id}`}
          className="flex-1 rounded-md border border-borderLight bg-white px-3 py-2 text-center text-[10px] font-900 uppercase tracking-widest text-textSecondary transition-all hover:border-brandBlue hover:text-brandBlue md:flex-none"
        >
          Перенести
        </Link>
        <Link
          to={`/bookings/${appointment.id}`}
          className="flex-1 rounded-md bg-textPrimary px-3 py-2 text-center text-[10px] font-900 uppercase tracking-widest text-white transition-all hover:bg-brandBlue md:flex-none"
        >
          Детали
        </Link>
      </div>
    </Card>
  )
}
