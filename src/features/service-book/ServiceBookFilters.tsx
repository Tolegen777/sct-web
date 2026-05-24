/**
 * Фильтры журнала: статус (все / активные / завершённые / отменённые)
 * и период (все / предстоящие / прошедшие / за месяц / за год).
 *
 * Состояние фильтров живёт в URL (status= / period=), чтобы можно было
 * вернуться на ту же выборку по back-кнопке браузера.
 */
import { useSearchParams } from 'react-router-dom'
import type { ServiceBookFilters as Filters } from './types'
import { cn } from '@/shared/lib/cn'

interface ServiceBookFiltersProps {
  filters: Filters
}

export function ServiceBookFiltersBar({ filters }: ServiceBookFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentStatus = searchParams.get('status') ?? filters.status ?? 'all'
  const currentPeriod = searchParams.get('period') ?? filters.period ?? 'all'

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === 'all') next.delete(k)
      else next.set(k, v)
    })
    setSearchParams(next, { replace: false })
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Chips
        label="Статус"
        value={currentStatus}
        options={filters.available_statuses}
        onChange={(v) => update({ status: v })}
      />
      <Chips
        label="Период"
        value={currentPeriod}
        options={filters.available_periods}
        onChange={(v) => update({ period: v })}
      />
    </div>
  )
}

function Chips({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const isActive = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-[11px] font-900 uppercase tracking-widest transition-colors',
                isActive
                  ? 'border-brandBlue bg-brandBlue text-white shadow-soft-blue'
                  : 'border-borderLight bg-white text-textSecondary hover:border-brandBlue hover:text-brandBlue',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
