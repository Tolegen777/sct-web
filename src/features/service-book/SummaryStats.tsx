/**
 * Карточки-метрики наверху сервисной книжки.
 */
import type { ServiceBookSummary } from './types'

interface SummaryStatsProps {
  summary: ServiceBookSummary
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const items = [
    {
      label: 'Всего записей',
      value: summary.appointments_total,
      accent: 'border-l-brandBlue',
    },
    {
      label: 'Активные',
      value: summary.active_appointments_count,
      accent: 'border-l-green-500',
    },
    {
      label: 'Завершено',
      value: summary.completed_appointments_count,
      accent: 'border-l-brandYellow',
    },
    {
      label: 'Сумма обслуживания',
      value: summary.total_spent?.display ?? '—',
      accent: 'border-l-slate-400',
    },
  ] as const

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-sct border border-borderLight bg-white p-4 shadow-sct-soft border-l-4 ${item.accent}`}
        >
          <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-900 tracking-tighter text-textPrimary">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
