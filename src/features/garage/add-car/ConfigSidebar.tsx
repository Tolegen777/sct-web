/**
 * Правый сайдбар «КОНФИГУРАЦИЯ» в конфигураторе добавления авто.
 *
 * Показывает прогресс сборки конфигурации: 4 пункта со статусом
 * «Ожидание…» → конкретное значение по мере выбора. Внизу — плашка
 * «Выбранное авто» с итоговым названием.
 *
 * Значения берём из state визарда (mark/model/specs/modification).
 * Это информационный блок, поэтому показываем «дружелюбные» поля:
 * марку+модель, год, название модификации, КПП·привод.
 */
import { cn } from '@/shared/lib/cn'
import type { Mark, Model, Modification } from './types'
import type { SpecsValues } from './SpecsStep'

interface ConfigSidebarProps {
  mark: Mark | null
  model: Model | null
  specs: SpecsValues
  modification: Modification | null
  /** Читаемое название выбранного кузова (с шага 3, до выбора модификации). */
  bodyLabel?: string | null
}

export function ConfigSidebar({ mark, model, specs, modification, bodyLabel }: ConfigSidebarProps) {
  const markModel = mark && model ? `${mark.display_name} ${model.name}` : null

  // Кузов и год: год + название кузова (с шага 3, либо из модификации).
  const bodyYear =
    [specs.year ? String(specs.year) : null, bodyLabel ?? modification?.configuration_name ?? null]
      .filter(Boolean)
      .join(' ') || null

  // Характеристики и КПП·привод — из label-полей выбранной модификации.
  const engineVol =
    modification?.engine_volume ? `${(modification.engine_volume / 1000).toFixed(1)} L` : null
  const chars = modification
    ? [modification.fuel_type_label, engineVol].filter(Boolean).join(' ') || null
    : null
  const drivetrain = modification
    ? [modification.transmission_type_label, modification.drive_type_label]
        .filter(Boolean)
        .join(' · ') || null
    : null

  const items = [
    { n: 1, label: 'Марка и модель', value: markModel },
    { n: 2, label: 'Кузов и год', value: bodyYear },
    { n: 3, label: 'Характеристики', value: chars },
    { n: 4, label: 'КПП и привод', value: drivetrain },
  ]

  // Выбранное авто: читаемое имя модификации (без pipe-разделителей).
  const selectedCar = modification
    ? (modification.full_title?.replace(/\s*\|\s*/g, ' ') ?? modification.name ?? markModel)
    : markModel

  return (
    <div className="rounded-sct-lg border border-borderLight bg-surfaceLight/60 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h3 className="text-[12px] font-900 uppercase tracking-widest text-textSecondary">
          Конфигурация
        </h3>
        <span className="h-2.5 w-2.5 rounded-full bg-brandBlue" />
      </header>

      <ol className="space-y-5">
        {items.map((it) => {
          const done = Boolean(it.value)
          return (
            <li key={it.n} className="flex gap-3">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-900',
                  done
                    ? 'border-brandBlue bg-brandBlue text-white'
                    : 'border-borderLight bg-white text-textSecondary',
                )}
              >
                {it.n}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    'text-[11px] font-900 uppercase tracking-widest',
                    done ? 'text-textPrimary' : 'text-textSecondary',
                  )}
                >
                  {it.label}
                </p>
                <p
                  className={cn(
                    'mt-0.5 truncate text-sm',
                    done ? 'font-bold text-brandBlue' : 'font-medium text-textSecondary/60',
                  )}
                >
                  {it.value ?? 'Ожидание…'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-6 border-t border-borderLight pt-5">
        <p className="text-center text-[12px] font-900 uppercase tracking-widest text-textSecondary">
          Выбранное авто
        </p>
        <div className="mt-3 rounded-sct border border-borderLight bg-white px-4 py-3 text-center">
          <p className="truncate text-sm font-900 uppercase tracking-tight text-textPrimary">
            {selectedCar ?? '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
