/**
 * Секция «История обслуживания» на главной — компактная таблица с
 * последними завершёнными визитами (до 5).
 *
 * Колонки: Дата · Услуга · Авто · Филиал · Сумма · Статус.
 * На мобиле таблица скроллится горизонтально.
 *
 * Если истории нет — секция не рендерится (пустую плашку на главной не
 * нужно). На странице /service-book показываем полный empty-state.
 */
import { Link } from 'react-router-dom'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { Card } from '@/shared/ui/Card'
import { formatDate, formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

export function HistoryTable() {
  const { data } = useServiceBookQuery({ status: 'completed', period: 'past', limit: 5, offset: 0 })
  if (!data) return null

  const history = data.appointments
    .filter((a) => !a.is_active || a.is_cancelled)
    .slice(0, 5)

  if (history.length === 0) return null

  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-3 md:mb-5">
        <div>
          <h2 className="text-xl font-900 uppercase tracking-tight text-textPrimary md:text-2xl">
            История обслуживания
          </h2>
          <p className="mt-1 text-[12px] font-medium text-textSecondary">
            Последние визиты, выполненные работы и суммы заказов
          </p>
        </div>
        <Link
          to="/service-book"
          className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Вся история →
        </Link>
      </header>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-borderLight bg-surfaceLight text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                <th className="px-4 py-3 text-left md:px-6">Дата</th>
                <th className="px-4 py-3 text-left md:px-6">Услуга</th>
                <th className="px-4 py-3 text-left md:px-6">Авто</th>
                <th className="px-4 py-3 text-right md:px-6">Сумма</th>
                <th className="px-4 py-3 text-center md:px-6">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight">
              {history.map((visit) => {
                const dt = visit.final_datetime ?? visit.scheduled_datetime ?? visit.preferred_datetime
                return (
                  <tr
                    key={visit.id}
                    className="cursor-pointer transition-colors hover:bg-surfaceLight/60"
                    onClick={() => {
                      // делаем кликабельной всю строку как ссылку через programmatic — но
                      // лучше навигировать через child link, чтобы Cmd+Click работал.
                    }}
                  >
                    <td className="px-4 py-3 font-bold text-textPrimary md:px-6">
                      {dt ? formatDate(dt) : '—'}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <Link
                        to={`/bookings/${visit.id}`}
                        className="font-900 uppercase tracking-tight text-textPrimary hover:text-brandBlue"
                      >
                        {visit.service_package.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-textSecondary md:px-6">
                      {visit.car.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-900 text-brandBlue md:px-6">
                      {visit.service_package.display_price || '—'}
                    </td>
                    <td className="px-4 py-3 text-center md:px-6">
                      <StatusChip status={visit.status} label={visit.status_label} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}

function StatusChip({ status, label }: { status: string; label: string }) {
  const cls =
    status === 'COMPLETED'
      ? 'bg-green-50 text-green-700 border-green-100'
      : status === 'CANCELLED'
      ? 'bg-red-50 text-red-700 border-red-100'
      : 'bg-surfaceMuted text-textSecondary border-borderLight'
  return (
    <span
      className={cn(
        'inline-block rounded-full border px-2.5 py-1 text-[9px] font-900 uppercase tracking-widest',
        cls,
      )}
    >
      {label}
    </span>
  )
}

// Suppress unused — formatMoney оставлен на случай если бэк начнёт отдавать display_price пустым.
export { formatMoney as _unused }
