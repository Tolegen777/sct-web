/**
 * Секция «Журнал обслуживания» (история).
 *
 * Если приходит pustoy список — рисуем большой плашку «История пуста».
 * Если есть записи — таблица-список с датой, услугой, филиалом, пробегом.
 */
import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'
import type { Booking } from '@/features/bookings/types'
import { formatDate } from '@/shared/lib/format'

interface HistorySectionProps {
  history: Booking[]
}

export function HistorySection({ history }: HistorySectionProps) {
  if (history.length === 0) {
    return (
      <Card className="border-2 border-dashed border-borderLight bg-surfaceLight/30 p-10 text-center md:p-14">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-inner">
          <svg
            className="h-8 w-8 text-textSecondary/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-900 uppercase tracking-tight text-textPrimary">
          История пуста
        </h3>
        <p className="mt-2 text-sm font-medium text-textSecondary opacity-60">
          Здесь появится список выполненных работ после визита.
        </p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-0">
      <header className="border-b border-borderLight px-5 py-4 md:px-6 md:py-5">
        <h3 className="text-base font-900 uppercase tracking-tight text-textPrimary md:text-lg">
          Журнал обслуживания
        </h3>
      </header>
      <ul className="divide-y divide-borderLight">
        {history.map((visit) => {
          const iso =
            visit.final_datetime ?? visit.scheduled_datetime ?? visit.preferred_datetime ?? ''
          const d = iso ? new Date(iso) : null
          const day = d ? d.toLocaleDateString('ru-RU', { day: '2-digit' }) : '--'
          const month = d ? d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : ''
          const station = visit.service_station_data?.address?.trim()
          return (
            <li key={visit.id}>
              <Link
                to={`/bookings/${visit.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surfaceLight/60 md:px-6 md:py-5"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-borderLight bg-surfaceLight">
                    <span className="text-sm font-900 leading-none text-textPrimary">{day}</span>
                    <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-textSecondary">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-900 uppercase tracking-tight text-textPrimary md:text-base">
                      {visit.service_data?.title ||
                        visit.service_package_data?.title ||
                        visit.default_service_page_data?.title ||
                        'Услуга'}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-widest text-textSecondary">
                      {station || formatDate(iso)}
                    </p>
                  </div>
                </div>
                <svg
                  className="h-5 w-5 shrink-0 text-borderLight"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
