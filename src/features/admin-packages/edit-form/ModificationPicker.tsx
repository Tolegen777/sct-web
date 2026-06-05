/**
 * Модалка выбора модификации авто для админ-формы пакета.
 *
 * UI: каскадные селекты Марка → Модель → Поколение + дополнительные
 * фильтры (Год, Кузов, Тип двигателя, КПП, Привод) + текстовый поиск.
 * Список модификаций обновляется реактивно по мере выбора.
 *
 * Источник: `/staff_endpoints/packages/cars-list-page-data/` (тот же,
 * что использует `AdminCarsPage`) — page-data со списком модификаций
 * клиентского парка + фильтры.
 *
 * Триггер: кнопка «Выбрать» рядом с полем; в форме `PackageForm` поле
 * становится read-only, а под ним показывается «человечный» лейбл.
 */
import { useMemo, useState } from 'react'
import { useAdminCarsList } from '@/features/admin-cars/queries'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import type { CarRow } from '@/features/admin-cars/types'

interface ModificationPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (sourceId: string, label: string) => void
}

interface PickerFilters {
  search: string
  mark: string
  model: string
  generation: string
  year: string
  body_type: string
  powertrain_type: string
  transmission_type: string
  drive_type: string
}

const EMPTY: PickerFilters = {
  search: '',
  mark: '',
  model: '',
  generation: '',
  year: '',
  body_type: '',
  powertrain_type: '',
  transmission_type: '',
  drive_type: '',
}

export function ModificationPicker({
  open,
  onClose,
  onSelect,
}: ModificationPickerProps) {
  const [filters, setFilters] = useState<PickerFilters>(EMPTY)
  const [page, setPage] = useState(1)

  const setFilter = (patch: Partial<PickerFilters>, resetPage = true) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    if (resetPage) setPage(1)
  }

  const query = useMemo(
    () => ({
      search: filters.search.trim() || undefined,
      mark: filters.mark ? Number(filters.mark) : undefined,
      model: filters.model ? Number(filters.model) : undefined,
      generation: filters.generation ? Number(filters.generation) : undefined,
      year: filters.year ? Number(filters.year) : undefined,
      body_type: filters.body_type ? Number(filters.body_type) : undefined,
      powertrain_type: filters.powertrain_type || undefined,
      transmission_type: filters.transmission_type || undefined,
      drive_type: filters.drive_type || undefined,
      page,
      page_size: 20 as const,
    }),
    [filters, page],
  )

  const { data, isLoading, isFetching } = useAdminCarsList(query)

  const handleSelect = (row: CarRow) => {
    const label = `${row.car.mark.name} ${row.car.model.name} — ${row.car.modification.name}`
    onSelect(row.id, label)
    onClose()
  }

  const reset = () => {
    setFilters(EMPTY)
    setPage(1)
  }

  const anyActive = Object.values(filters).some((v) => v !== '')

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="mb-5">
        <h2 className="text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
          Выбор модификации
        </h2>
        <p className="mt-1.5 text-sm text-textSecondary">
          Найдите модификацию авто, к которой привязать пакет услуг.
        </p>
      </div>

      {/* Каскадные селекты */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SelectCol
          label="Марка"
          value={filters.mark}
          onChange={(v) =>
            setFilter({ mark: v, model: '', generation: '', body_type: '', year: '' })
          }
          options={data?.filters.marks ?? []}
        />
        <SelectCol
          label="Модель"
          value={filters.model}
          onChange={(v) => setFilter({ model: v, generation: '' })}
          options={data?.filters.models ?? []}
          disabled={!filters.mark}
        />
        <SelectCol
          label="Поколение"
          value={filters.generation}
          onChange={(v) => setFilter({ generation: v })}
          options={data?.filters.generations ?? []}
          disabled={!filters.model}
        />
        <SelectCol
          label="Год выпуска"
          value={filters.year}
          onChange={(v) => setFilter({ year: v })}
          options={data?.filters.years ?? []}
        />
        <SelectCol
          label="Кузов"
          value={filters.body_type}
          onChange={(v) => setFilter({ body_type: v })}
          options={data?.filters.body_types ?? []}
        />
        <SelectCol
          label="Тип двигателя"
          value={filters.powertrain_type}
          onChange={(v) => setFilter({ powertrain_type: v })}
          options={data?.filters.powertrain_types ?? []}
        />
        <SelectCol
          label="КПП"
          value={filters.transmission_type}
          onChange={(v) => setFilter({ transmission_type: v })}
          options={data?.filters.transmission_types ?? []}
        />
        <SelectCol
          label="Привод"
          value={filters.drive_type}
          onChange={(v) => setFilter({ drive_type: v })}
          options={data?.filters.drive_types ?? []}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-9">
          <Input
            label="Поиск (необязательно)"
            placeholder="Toyota, Camry, source_id…"
            value={filters.search}
            onChange={(e) => setFilter({ search: e.target.value })}
          />
        </div>
        <div className="flex items-end md:col-span-3">
          <button
            type="button"
            onClick={reset}
            disabled={!anyActive}
            className="w-full rounded-sct border border-borderLight bg-white px-4 py-3 text-[11px] font-900 uppercase tracking-widest text-textSecondary transition-colors hover:border-brandBlue hover:text-brandBlue disabled:cursor-not-allowed disabled:opacity-50"
          >
            Сбросить
          </button>
        </div>
      </div>

      {/* Результаты */}
      <div className="mt-5 max-h-[360px] overflow-y-auto rounded-sct border border-borderLight">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner />
          </div>
        ) : !data || data.results.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-textSecondary">
            Ничего не нашлось. Попробуйте сбросить часть фильтров.
          </div>
        ) : (
          <ul className={cn('divide-y divide-borderLight', isFetching && 'opacity-60')}>
            {data.results.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(row)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-surfaceLight"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-900 uppercase tracking-tight text-textPrimary">
                      {row.car.mark.name} {row.car.model.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-tighter text-textSecondary">
                      {row.car.generation?.display_name && `${row.car.generation.display_name} · `}
                      {row.car.configuration?.name && `${row.car.configuration.name} · `}
                      {row.car.modification.name}
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-textSecondary/70">
                      {row.id}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                    <span className="rounded-md bg-surfaceLight px-2 py-0.5">
                      {row.clients_count} клиент.
                    </span>
                    {row.has_packages && (
                      <span className="rounded-md border border-green-100 bg-green-50 px-2 py-0.5 text-green-700">
                        {row.packages_count} пак.
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Пагинация */}
      {data && data.pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-textSecondary">
            Стр. {data.pagination.page} из {data.pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!data.pagination.has_previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Назад
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!data.pagination.has_next}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд →
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Закрыть
        </Button>
      </div>
    </Modal>
  )
}

function SelectCol({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string
  value: string
  options: Array<{ value: string | number; label: string; count?: number }>
  onChange: (next: string) => void
  disabled?: boolean
}) {
  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Все</option>
      {options.map((o) => (
        <option key={o.value} value={String(o.value)}>
          {o.label}
          {typeof o.count === 'number' ? ` (${o.count})` : ''}
        </option>
      ))}
    </Select>
  )
}
