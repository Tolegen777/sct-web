/**
 * Индикатор шагов с прогресс-баром и табами.
 * Используется во всех wizard-ах. Шаги «вперёд» доступны только после
 * заполнения текущего, поэтому disabled-таб выглядит приглушённо.
 */
import { cn } from '@/shared/lib/cn'

export interface StepDef {
  id: string
  title: string
}

interface StepperProps {
  steps: StepDef[]
  activeIndex: number
  maxUnlockedIndex: number
  onSelect: (index: number) => void
}

export function Stepper({ steps, activeIndex, maxUnlockedIndex, onSelect }: StepperProps) {
  const progress = ((activeIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex gap-6 overflow-x-auto pb-2 no-scrollbar md:gap-8">
        {steps.map((s, i) => {
          const isActive = i === activeIndex
          const isUnlocked = i <= maxUnlockedIndex
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => isUnlocked && onSelect(i)}
              className={cn(
                'relative whitespace-nowrap pb-3 text-[12px] font-900 uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-brandBlue after:absolute after:-bottom-px after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-brandBlue'
                  : isUnlocked
                  ? 'text-textSecondary hover:text-brandBlue cursor-pointer'
                  : 'text-textSecondary/40 cursor-not-allowed',
              )}
            >
              {i + 1}. {s.title}
            </button>
          )
        })}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surfaceMuted">
        <div
          className="h-full rounded-full bg-brandYellow transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
