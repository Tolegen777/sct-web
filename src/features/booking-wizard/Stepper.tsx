/**
 * Прогресс шагов wizard'а с двумя представлениями:
 *   - На `md+`: горизонтальный ряд кнопок («1. Авто / 2. Филиал / ...»),
 *     по клику можно вернуться на пройденный шаг.
 *   - На мобиле: компактный блок «Шаг 2 из 4 · Филиал»  +  список номеров
 *     1 · 2 · 3 · 4 (точками), активный выделен. Так не плодим
 *     2-3-строчные стек шагов на узком экране.
 */
import { cn } from '@/shared/lib/cn'

export type WizardStep = 'car' | 'branch' | 'datetime' | 'confirm'

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'car', label: 'Авто' },
  { key: 'branch', label: 'Филиал' },
  { key: 'datetime', label: 'Дата и время' },
  { key: 'confirm', label: 'Подтверждение' },
]

interface StepperProps {
  current: WizardStep
  completed: WizardStep[]
  onJump: (step: WizardStep) => void
}

export function Stepper({ current, completed, onJump }: StepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)
  const currentStep = STEPS[currentIdx]

  return (
    <div>
      {/* Mobile (< md): компактная инфо-строка */}
      <div className="md:hidden">
        <p className="text-[10px] font-900 uppercase tracking-[0.2em] text-brandBlue">
          Шаг {currentIdx + 1} из {STEPS.length}
        </p>
        <p className="mt-1 text-base font-900 uppercase tracking-tight text-textPrimary">
          {currentStep.label}
        </p>
        {/* Точки-индикаторы */}
        <div className="mt-3 flex items-center gap-2">
          {STEPS.map((step, idx) => {
            const isActive = step.key === current
            const isDone = completed.includes(step.key)
            const isReachable = isDone || idx < currentIdx
            return (
              <button
                key={step.key}
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onJump(step.key)}
                aria-label={`Шаг ${idx + 1}: ${step.label}`}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  isActive
                    ? 'bg-brandBlue'
                    : isDone
                    ? 'cursor-pointer bg-brandBlue/40 hover:bg-brandBlue/60'
                    : 'cursor-not-allowed bg-surfaceMuted',
                )}
              />
            )
          })}
        </div>
      </div>

      {/* Desktop (md+): полноценные шаги */}
      <div className="hidden flex-wrap gap-x-6 border-b border-borderLight pb-3 md:flex md:gap-x-10">
        {STEPS.map((step, idx) => {
          const isActive = step.key === current
          const isDone = completed.includes(step.key)
          const isReachable = isDone || isActive || idx <= currentIdx
          return (
            <button
              key={step.key}
              type="button"
              disabled={!isReachable}
              onClick={() => isReachable && onJump(step.key)}
              className={cn(
                'relative pb-2 text-[12px] font-900 uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-brandBlue after:absolute after:-bottom-3 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-brandBlue'
                  : isReachable
                  ? 'text-textSecondary hover:text-brandBlue'
                  : 'cursor-not-allowed text-textSecondary/40',
              )}
            >
              {idx + 1}. {step.label}
            </button>
          )
        })}
      </div>

      {/* Прогресс-бар (жёлтый) — только на md+, на мобиле точки выше уже его заменяют */}
      <div className="mt-3 hidden h-1.5 overflow-hidden rounded-full bg-surfaceMuted md:block">
        <div
          className="h-full bg-brandYellow transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
