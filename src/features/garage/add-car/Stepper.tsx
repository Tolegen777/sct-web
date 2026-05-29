/**
 * Верхняя панель конфигуратора добавления авто (по дизайну new_screens).
 *
 * Desktop (md+): ряд табов шагов + кнопка «Ввести VIN код» справа, под ними —
 *   жёлтый прогресс-бар на всю ширину.
 * Mobile (<md): прогресс-бар, ниже «‹ N. Название шага» (назад), ниже —
 *   кнопка «Ввести VIN код».
 *
 * Шаги «вперёд» доступны только после заполнения текущего (приглушены).
 * Используется только в AddCarWizard (у booking-wizard свой Stepper).
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
  onBack: () => void
  onVinClick: () => void
}

export function Stepper({
  steps,
  activeIndex,
  maxUnlockedIndex,
  onSelect,
  onBack,
  onVinClick,
}: StepperProps) {
  const progress = ((activeIndex + 1) / steps.length) * 100
  const current = steps[activeIndex]

  const vinButton = (
    <button
      type="button"
      onClick={onVinClick}
      className="shrink-0 rounded-sct bg-brandBlue px-6 py-3 text-[12px] font-900 uppercase tracking-widest text-white shadow-soft-blue transition-all hover:bg-brandBlueDark"
    >
      Ввести VIN код
    </button>
  )

  const progressBar = (
    <div className="h-1.5 overflow-hidden rounded-full bg-surfaceMuted">
      <div
        className="h-full rounded-full bg-brandYellow transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )

  return (
    <div>
      {/* Desktop */}
      <div className="hidden space-y-4 md:block">
        <div className="flex items-center justify-between gap-6">
          <div className="flex gap-6 lg:gap-8">
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
                        ? 'cursor-pointer text-textSecondary hover:text-brandBlue'
                        : 'cursor-not-allowed text-textSecondary/40',
                  )}
                >
                  {i + 1}. {s.title}
                </button>
              )
            })}
          </div>
          {vinButton}
        </div>
        {progressBar}
      </div>

      {/* Mobile */}
      <div className="space-y-4 md:hidden">
        {progressBar}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-2xl font-900 uppercase tracking-tight text-textPrimary"
        >
          <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          {activeIndex + 1}. {current.title}
        </button>
        <div>{vinButton}</div>
      </div>
    </div>
  )
}
