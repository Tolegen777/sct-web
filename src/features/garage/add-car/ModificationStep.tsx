/**
 * Шаг 4 «Характеристики» (по дизайну new_screens).
 *
 * Сверху — chip-фильтры (тип топлива, объём, мощность, КПП, привод, руль),
 * значения берём из filters/?... (показываем только доступные). Ниже —
 * «Подходящие авто (N)» карточками с фото. Внизу кнопка «Выбрать авто»
 * подтверждает выбранную модификацию и ведёт на шаг 5.
 *
 * Внимание (бэк): дизайн рисует мощность/объём диапазонами (100-150, 1.6 L…),
 * но API фильтрует по точным значениям engine_volume/horse_power, поэтому
 * показываем реальные доступные значения как чипы.
 */
import { useMemo } from 'react'
import { useFiltersQuery, useModificationsQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import { formatEngineVolume } from '@/shared/lib/format'
import type { CarsQuery, CodeNameOption, FiltersResponse, Modification } from './types'
import type { SpecsValues } from './SpecsStep'

interface ModificationStepProps {
  markId: number
  modelId: number
  specs: SpecsValues
  onSpecsChange: (next: SpecsValues) => void
  selectedSourceId: string | null
  onSelect: (modification: Modification) => void
  onConfirm: () => void
  page: number
  onPageChange: (page: number) => void
}

const PAGE_SIZE = 20

interface ChipOption {
  value: string
  label: string
}

export function ModificationStep({
  markId,
  modelId,
  specs,
  onSpecsChange,
  selectedSourceId,
  onSelect,
  onConfirm,
  page,
  onPageChange,
}: ModificationStepProps) {
  const baseQuery: CarsQuery = useMemo(
    () => ({ mark: markId, model: modelId, ...specs }),
    [markId, modelId, specs],
  )

  const { data: filters } = useFiltersQuery(baseQuery)
  const {
    data: mods,
    isLoading,
    isError,
  } = useModificationsQuery({ ...baseQuery, page, page_size: PAGE_SIZE })

  const items: Modification[] = mods?.results ?? []
  const totalPages = mods ? Math.max(1, Math.ceil((mods.count ?? 0) / PAGE_SIZE)) : 1

  const setFilter = (patch: Partial<SpecsValues>) => onSpecsChange({ ...specs, ...patch })

  // Опции чипов из filters/?...
  const fuelOpts: ChipOption[] = (filters?.fuel_types ?? []).map((f) => ({
    value: f.value,
    label: f.label || f.value,
  }))
  const volumeOpts: ChipOption[] = (filters?.engine_volumes ?? []).map((o) => ({
    value: String(o.value),
    label: formatEngineVolume(o.value) ?? String(o.value),
  }))
  const powerOpts: ChipOption[] = (filters?.horse_powers ?? []).map((o) => ({
    value: String(o.value),
    label: String(o.value),
  }))
  const transOpts = mapCodeName(filters?.transmission_types)
  const driveOpts = mapCodeName(filters?.drive_types)
  const steerOpts = mapCodeName(filters?.steering_positions)

  return (
    <div className="space-y-8">
      <ChipGroup
        label="Тип топлива"
        options={fuelOpts}
        value={specs.fuel_type}
        onToggle={(v) => setFilter({ fuel_type: v })}
      />
      <ChipGroup
        label="Объём двигателя"
        options={volumeOpts}
        value={specs.engine_volume !== undefined ? String(specs.engine_volume) : undefined}
        onToggle={(v) => setFilter({ engine_volume: v ? Number(v) : undefined })}
      />
      <ChipGroup
        label="Мощность (л.с.)"
        options={powerOpts}
        value={specs.horse_power !== undefined ? String(specs.horse_power) : undefined}
        onToggle={(v) => setFilter({ horse_power: v ? Number(v) : undefined })}
      />
      <ChipGroup
        label="Коробка передач"
        options={transOpts}
        value={specs.transmission_type}
        onToggle={(v) => setFilter({ transmission_type: v })}
      />
      <ChipGroup
        label="Тип привода"
        options={driveOpts}
        value={specs.drive_type}
        onToggle={(v) => setFilter({ drive_type: v })}
      />
      <ChipGroup
        label="Тип руля"
        options={steerOpts}
        value={specs.steering_wheel_position}
        onToggle={(v) => setFilter({ steering_wheel_position: v })}
      />

      {/* Подходящие авто */}
      <section className="border-t border-borderLight pt-8">
        <h3 className="mb-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary">
          Подходящие авто {mods ? `(${(mods.count ?? items.length).toLocaleString('ru-RU')})` : ''}
        </h3>

        {isLoading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="rounded-sct border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Не удалось загрузить модификации.
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
            <p className="text-sm font-bold text-textSecondary">
              Под выбранные параметры авто не найдены. Уберите часть фильтров.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {items.map((m) => (
              <ModCard
                key={m.id}
                mod={m}
                active={m.source_id === selectedSourceId}
                onSelect={() => onSelect(m)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-textSecondary hover:border-brandBlue hover:text-brandBlue disabled:opacity-40"
            >
              ← Назад
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-textSecondary">
              Стр. {page} из {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-textSecondary hover:border-brandBlue hover:text-brandBlue disabled:opacity-40"
            >
              Вперёд →
            </button>
          </div>
        )}
      </section>

      <button
        type="button"
        disabled={!selectedSourceId}
        onClick={onConfirm}
        className="w-full rounded-sct bg-brandBlue py-4 text-sm font-900 uppercase tracking-[0.15em] text-white shadow-soft-blue transition-all hover:bg-brandBlueDark disabled:cursor-not-allowed disabled:opacity-50"
      >
        Выбрать авто
      </button>
    </div>
  )
}

function ChipGroup({
  label,
  options,
  value,
  onToggle,
}: {
  label: string
  options: ChipOption[]
  value: string | undefined
  onToggle: (value: string | undefined) => void
}) {
  if (options.length === 0) return null
  return (
    <section>
      <h3 className="mb-3 text-[12px] font-900 uppercase tracking-widest text-textSecondary">
        {label}
      </h3>
      <div className="flex flex-wrap gap-3">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onToggle(active ? undefined : o.value)}
              className={cn(
                'min-w-[84px] rounded-sct border px-4 py-2.5 text-center text-[13px] font-bold transition-all',
                active
                  ? 'border-brandBlue bg-blue-50/50 text-brandBlue shadow-soft-blue'
                  : 'border-borderLight bg-white text-textPrimary hover:border-brandBlue/40',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function ModCard({
  mod,
  active,
  onSelect,
}: {
  mod: Modification
  active: boolean
  onSelect: () => void
}) {
  const title = mod.name || mod.full_title || mod.display_name || `Модификация ${mod.id}`
  // Дополнительные различающие поля — собираем в одну строку через «·».
  // group_name — это трим/комплектация (часто единственное различие при
  // одинаковом названии модификации, см. реальные ответы /modifications/).
  const yearRange =
    mod.year_from || mod.year_to
      ? `${mod.year_from ?? ''}${mod.year_to ? `–${mod.year_to}` : ''}`
      : null
  const sub =
    [mod.configuration_name, yearRange, mod.drive_type_label].filter(Boolean).join(' · ') ||
    `MOD ${mod.id}`
  const image = mod.photo_url ?? undefined

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'overflow-hidden rounded-sct border bg-white text-left transition-all',
        active
          ? 'border-brandBlue shadow-soft-blue'
          : 'border-borderLight hover:border-brandBlue/40 hover:shadow-sct-soft',
      )}
    >
      <div className="aspect-[16/10] bg-surfaceLight">
        <SafeImage
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center text-2xl font-900 uppercase text-borderLight">
              {title.slice(0, 2)}
            </div>
          }
        />
      </div>
      <div className="p-3">
        {mod.group_name && (
          <p className="truncate text-[10px] font-900 uppercase tracking-widest text-brandBlue">
            {mod.group_name}
          </p>
        )}
        <p className="truncate text-sm font-900 uppercase tracking-tight text-textPrimary">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-widest text-textSecondary">
          {sub}
        </p>
      </div>
    </button>
  )
}

function mapCodeName(items: FiltersResponse['transmission_types'] | undefined): ChipOption[] {
  if (!items) return []
  return items.map((it: CodeNameOption) => ({
    value: it.value,
    label: it.label ?? it.name ?? it.code ?? it.value,
  }))
}
