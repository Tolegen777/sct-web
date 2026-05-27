/**
 * Шаг «Выбор филиала».
 *
 * Карточки филиалов в одну колонку (как в HTML-мокапе booking_workflow_v1):
 * иконка → название → адрес → «Ближайшее окно» (берётся из расписания).
 *
 * Если у филиала сегодня is_closed — показываем «Сегодня выходной».
 */
import { useServiceStationsQuery } from '@/features/service-stations/queries'
import type { ServiceStation } from '@/features/service-stations/types'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'

interface BranchStepProps {
  selectedId: number | null
  onSelect: (station: ServiceStation) => void
}

export function BranchStep({ selectedId, onSelect }: BranchStepProps) {
  const { data, isLoading, isError } = useServiceStationsQuery({ days: 14 })

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data || data.results.length === 0) {
    return (
      <p className="rounded-sct border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        Не удалось загрузить список филиалов. Попробуйте обновить страницу.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="mb-5">
        <h2 className="text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
          Выберите филиал
        </h2>
        <p className="mt-1 text-sm font-medium text-textSecondary">
          Укажите, в каком филиале вам удобнее пройти обслуживание.
        </p>
      </div>

      {data.results.map((station) => (
        <BranchCard
          key={station.id}
          station={station}
          isSelected={station.id === selectedId}
          onSelect={() => onSelect(station)}
        />
      ))}
    </div>
  )
}

function BranchCard({
  station,
  isSelected,
  onSelect,
}: {
  station: ServiceStation
  isSelected: boolean
  onSelect: () => void
}) {
  const nearestSlot = getNearestOpenLabel(station)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group flex w-full items-center justify-between gap-4 rounded-sct border bg-white p-4 text-left transition-all md:p-5',
        isSelected
          ? 'border-brandBlue shadow-soft-blue'
          : 'border-borderLight hover:border-brandBlue/40 hover:shadow-soft-card',
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-sct border transition-colors md:h-14 md:w-14',
            isSelected
              ? 'border-brandBlue bg-brandBlue text-white'
              : 'border-borderLight bg-surfaceLight text-brandBlue group-hover:bg-blue-50',
          )}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="min-w-0">
          <h4 className="text-base font-900 uppercase italic tracking-tight text-textPrimary">
            {station.name}
          </h4>
          <p className="mt-0.5 text-sm font-medium text-textSecondary">{station.address}</p>
          {nearestSlot && (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brandBlue">
              Ближайшее окно: {nearestSlot}
            </p>
          )}
        </div>
      </div>

      <div className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary md:flex">
        {isSelected ? 'Выбран' : 'Выбрать'}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

function getNearestOpenLabel(station: ServiceStation): string | null {
  const today = station.schedule.find((d) => d.is_today)
  if (today && !today.is_closed && today.available) {
    return `Сегодня · ${today.label}`
  }
  const next = station.schedule.find((d) => !d.is_today && !d.is_closed && d.available)
  if (!next) return null
  return `${next.weekday_label} · ${next.label}`
}
