/**
 * Шаг 3: технические параметры.
 *
 * Все фильтры опциональны — пользователь может пропустить и сразу выбрать
 * любую модификацию на следующем шаге. Сверху живой счётчик "найдено N
 * модификаций" — он обновляется по filters/?... запросу при каждом изменении.
 *
 * Из бэка приходят доступные значения каждого фильтра — мы их и показываем
 * (нельзя выбрать год, которого нет у этой модели).
 */
import { useMemo } from 'react'
import { useFiltersQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Select } from '@/shared/ui/Select'
import type {
  CarsQuery,
  CodeNameOption,
  FiltersResponse,
} from './types'

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
}

export function SpecsStep({ markId, markLabel, modelId, modelLabel, values, onChange }: SpecsStepProps) {
  const query: CarsQuery = useMemo(
    () => ({
      mark: markId,
      model: modelId,
      ...values,
    }),
    [markId, modelId, values],
  )

  const { data, isFetching, isError } = useFiltersQuery(query)

  const set = (patch: Partial<SpecsValues>) => onChange({ ...values, ...patch })
  const clear = () => onChange({})

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            Параметры
          </h2>
          <p className="mt-2 text-sm text-textSecondary">
            {markLabel} {modelLabel} — уточните характеристики
          </p>
        </div>
        <div className="rounded-sct border border-borderLight bg-surfaceLight px-4 py-2">
          <span className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            Найдено
          </span>
          <p className="text-2xl font-900 italic tracking-tighter text-brandBlue">
            {isFetching ? (
              <Spinner className="inline-block h-5 w-5" />
            ) : (
              (data?.modifications_count ?? 0).toLocaleString('ru-RU')
            )}
          </p>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-sct border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <p className="font-bold">Сервер не смог посчитать модификации под эти параметры.</p>
          <p className="mt-1 text-xs">
            Попробуйте сбросить часть фильтров или переходите сразу к выбору модификации.
          </p>
          <button
            type="button"
            onClick={clear}
            className="mt-2 text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
          >
            Сбросить
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SelectField
          label="Год выпуска"
          value={values.year !== undefined ? String(values.year) : ''}
          onChange={(v) => set({ year: v ? Number(v) : undefined })}
          options={(data?.years ?? []).map((y) => ({ value: String(y), label: String(y) }))}
        />

        <SelectField
          label="Поколение"
          value={values.generation !== undefined ? String(values.generation) : ''}
          onChange={(v) => set({ generation: v ? Number(v) : undefined })}
          options={(data?.generations ?? []).map((g) => ({
            value: String(g.id),
            label: `${g.display_name} (${g.year_from}–${g.year_to})`,
          }))}
        />

        <SelectField
          label="Тип кузова"
          value={values.body_type !== undefined ? String(values.body_type) : ''}
          onChange={(v) => set({ body_type: v ? Number(v) : undefined })}
          options={(data?.body_types ?? []).map((b) => ({
            value: String(b.id),
            label: b.name || b.code,
          }))}
        />

        <SelectField
          label="Двигатель"
          value={values.fuel_type ?? ''}
          onChange={(v) => set({ fuel_type: v || undefined })}
          options={(data?.fuel_types ?? []).map((f) => ({
            value: f.value,
            label: f.label || f.value,
          }))}
        />

        <SelectField
          label="Объем (см³)"
          value={values.engine_volume !== undefined ? String(values.engine_volume) : ''}
          onChange={(v) => set({ engine_volume: v ? Number(v) : undefined })}
          options={(data?.engine_volumes ?? []).map((o) => ({
            value: String(o.value),
            label: `${(o.value / 1000).toFixed(1)}`,
          }))}
        />

        <SelectField
          label="Мощность (л.с.)"
          value={values.horse_power !== undefined ? String(values.horse_power) : ''}
          onChange={(v) => set({ horse_power: v ? Number(v) : undefined })}
          options={(data?.horse_powers ?? []).map((o) => ({
            value: String(o.value),
            label: String(o.value),
          }))}
        />

        <SelectField
          label="КПП"
          value={values.transmission_type ?? ''}
          onChange={(v) => set({ transmission_type: v || undefined })}
          options={mapCodeNameOptions(data?.transmission_types)}
        />

        <SelectField
          label="Привод"
          value={values.drive_type ?? ''}
          onChange={(v) => set({ drive_type: v || undefined })}
          options={mapCodeNameOptions(data?.drive_types)}
        />

        <SelectField
          label="Руль"
          value={values.steering_wheel_position ?? ''}
          onChange={(v) => set({ steering_wheel_position: v || undefined })}
          options={mapCodeNameOptions(data?.steering_positions)}
        />
      </div>

      {Object.keys(values).length > 0 && (
        <button
          type="button"
          onClick={clear}
          className="mt-6 text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Сбросить параметры
        </button>
      )}
    </div>
  )
}

interface SelectOption {
  value: string
  label: string
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
}) {
  const empty = options.length === 0
  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={empty}
    >
      <option value="">{empty ? '—' : 'Любой'}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  )
}

function mapCodeNameOptions(items: FiltersResponse['transmission_types'] | undefined): SelectOption[] {
  if (!items) return []
  return items.map((it: CodeNameOption) => ({
    value: it.value,
    label: it.label ?? it.name ?? it.code ?? it.value,
  }))
}
