/**
 * Шаг 3 «Поколение»: год выпуска → тип кузова → поколение (по дизайну).
 *
 * UX: плитки «Год выпуска» → после выбора года раскрывается «Тип кузова»
 * (карточки с силуэтами) → затем «Поколение» (карточки с фото и годами).
 * Выбор поколения ведёт к шагу 4. Если поколений нет — показываем «Далее».
 *
 * Остальные характеристики (двигатель, КПП, привод) на этом шаге не
 * показываем — они определяются модификацией на шаге 4. Доступные значения
 * приходят из filters/?mark=&model=&year=&body_type=.
 *
 * Фото поколений бэк не отдаёт — SafeImage показывает фолбэк.
 */
import { useMemo } from 'react'
import { useFiltersQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import type { CarsQuery } from './types'

export interface SpecsValues {
  year?: number
  body_type?: number
  generation?: number
  fuel_type?: string
  engine_volume?: number
  horse_power?: number
  transmission_type?: string
  drive_type?: string
  steering_wheel_position?: string
}

interface SpecsStepProps {
  markId: number
  markLabel: string
  modelId: number
  modelLabel: string
  values: SpecsValues
  onChange: (next: SpecsValues) => void
  /** Сообщает читаемое название выбранного кузова (для сайдбара). */
  onBodyLabel?: (label: string | null) => void
  onNext: () => void
}

export function SpecsStep({ markId, modelId, values, onChange, onBodyLabel, onNext }: SpecsStepProps) {
  const query: CarsQuery = useMemo(
    () => ({ mark: markId, model: modelId, ...values }),
    [markId, modelId, values],
  )

  const { data, isFetching, isError } = useFiltersQuery(query)

  const years = data?.years ?? []
  const bodyTypes = data?.body_types ?? []
  const generations = data?.generations ?? []

  const selectYear = (y: number) => {
    // Смена года сбрасывает кузов и поколение — они зависят от года.
    onChange({
      ...values,
      year: values.year === y ? undefined : y,
      body_type: undefined,
      generation: undefined,
    })
    onBodyLabel?.(null)
  }

  const selectBody = (id: number) => {
    // Выбор кузова раскрывает поколения (не продвигает шаг); сбрасывает поколение.
    const next = values.body_type === id ? undefined : id
    onChange({ ...values, body_type: next, generation: undefined })
    onBodyLabel?.(next ? bodyTypes.find((b) => b.id === id)?.name ?? null : null)
  }

  const selectGeneration = (id: number) => {
    onChange({ ...values, generation: id })
    onNext()
  }

  if (isFetching && !data) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Если поколений для выбора нет — даём кнопку «Далее» (путь вперёд,
  // особенно на мобиле, где нет табов шагов).
  const showFallbackNext =
    years.length === 0 || (values.year !== undefined && generations.length === 0)

  return (
    <div className="space-y-8">
      {isError && (
        <div className="rounded-sct border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-bold">Сервер не смог посчитать параметры под эту модель.</p>
          <p className="mt-1 text-xs">Можно пропустить и перейти к выбору модификации.</p>
        </div>
      )}

      {/* Год выпуска */}
      <section>
        <h3 className="mb-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary">
          Год выпуска
        </h3>
        {years.length === 0 ? (
          <p className="text-sm text-textSecondary/70">
            Нет доступных годов — перейдите к выбору модификации.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-6">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => selectYear(y)}
                className={cn(
                  'rounded-sct border py-3.5 text-base font-900 tracking-tight transition-all',
                  values.year === y
                    ? 'border-brandBlue bg-blue-50/50 text-brandBlue shadow-soft-blue'
                    : 'border-borderLight bg-white text-textPrimary hover:border-brandBlue/40',
                )}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Тип кузова — раскрывается после выбора года */}
      {values.year !== undefined && bodyTypes.length > 0 && (
        <section className="border-t border-borderLight pt-8">
          <h3 className="mb-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary">
            Тип кузова
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {bodyTypes.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => selectBody(b.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-sct border bg-white px-4 py-6 transition-all',
                  values.body_type === b.id
                    ? 'border-brandBlue shadow-soft-blue'
                    : 'border-borderLight hover:border-brandBlue/40 hover:shadow-sct-soft',
                )}
              >
                <BodyIcon code={b.code} name={b.name} />
                <span className="text-[12px] font-900 uppercase tracking-tight text-textPrimary">
                  {b.name || b.code}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Поколение — раскрывается после выбора года (сужается кузовом) */}
      {values.year !== undefined && generations.length > 0 && (
        <section className="border-t border-borderLight pt-8">
          <h3 className="mb-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary">
            Поколение
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {generations.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => selectGeneration(g.id)}
                className={cn(
                  'flex items-center gap-4 rounded-sct border bg-white p-3 text-left transition-all',
                  values.generation === g.id
                    ? 'border-brandBlue shadow-soft-blue'
                    : 'border-borderLight hover:border-brandBlue/40 hover:shadow-sct-soft',
                )}
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-borderLight bg-surfaceLight">
                  <SafeImage
                    src={undefined}
                    alt={g.display_name}
                    className="h-full w-full object-cover"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center text-borderLight">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v3a1 1 0 001 1h1m14-6a2 2 0 012 2v3a1 1 0 01-1 1h-1M7 17a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm10 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z" />
                        </svg>
                      </div>
                    }
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-900 uppercase tracking-tight text-textPrimary">
                    {g.display_name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-textSecondary">
                    {g.year_from}{g.year_to ? `–${g.year_to}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {showFallbackNext && (
        <div className="flex justify-end">
          <Button onClick={onNext}>Далее</Button>
        </div>
      )}
    </div>
  )
}

const BODY_PATHS: Record<string, string> = {
  sedan: 'M4 17 L9 11 L19 11 L23 8 L31 8 L35 11 L44 12 L44 17 Z',
  wagon: 'M4 17 L9 10 L33 10 L37 12 L44 12 L44 17 Z',
  coupe: 'M4 17 L10 12 L20 8 L30 9 L36 12 L44 13 L44 17 Z',
  suv: 'M4 17 L8 9 L33 9 L38 12 L44 12 L44 17 Z',
  hatch: 'M4 17 L9 11 L22 11 L28 14 L44 14 L44 17 Z',
  car: 'M4 17 L9 11 L19 11 L23 8 L31 8 L35 11 L44 12 L44 17 Z',
}

function BodyIcon({ code, name }: { code?: string; name?: string }) {
  const key = `${code ?? ''} ${name ?? ''}`.toLowerCase()
  const type = /седан|sedan/.test(key)
    ? 'sedan'
    : /универс|wagon|estate|universal/.test(key)
      ? 'wagon'
      : /куп|coupe/.test(key)
        ? 'coupe'
        : /suv|кроссов|внедорож|crossover/.test(key)
          ? 'suv'
          : /хэтч|хетч|hatch/.test(key)
            ? 'hatch'
            : 'car'

  return (
    <svg className="h-7 w-12 text-textPrimary" viewBox="0 0 48 24" fill="currentColor" aria-hidden>
      <path d={BODY_PATHS[type]} />
      <circle cx="14" cy="18" r="2.6" />
      <circle cx="34" cy="18" r="2.6" />
    </svg>
  )
}
