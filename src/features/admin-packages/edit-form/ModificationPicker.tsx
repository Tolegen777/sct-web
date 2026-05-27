/**
 * Модалка выбора модификации авто для админ-формы пакета.
 *
 * Заменяет ручной ввод `modification_source_id` в форме пакета — даёт
 * полноценный поиск с фильтрами (марка, модель, поиск по тексту).
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

export function ModificationPicker({
  open,
  onClose,
  onSelect,
}: ModificationPickerProps) {
  const [search, setSearch] = useState('')
  const [mark, setMark] = useState<string>('')
  const [page, setPage] = useState(1)

  const query = useMemo(
    () => ({
      search: search.trim() || undefined,
      mark: mark ? Number(mark) : undefined,
      page,
      page_size: 20 as const,
    }),
    [search, mark, page],
  )

  const { data, isLoading, isFetching } = useAdminCarsList(query)

  const handleSelect = (row: CarRow) => {
    const label = `${row.car.mark.name} ${row.car.model.name} — ${row.car.modification.name}`
    onSelect(row.id, label)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Выбор модификации" size="lg">
      <p className="-mt-2 mb-5 text-sm text-textSecondary">
        Найдите модификацию авто, к которой привязать пакет услуг.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-7">
          <Input
            label="Поиск"
            placeholder="Toyota, Camry, source_id..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <div className="md:col-span-5">
          <Select
            label="Марка"
            value={mark}
            onChange={(e) => {
              setMark(e.target.value)
              setPage(1)
            }}
            disabled={!data}
          >
            <option value="">Все марки</option>
            {(data?.filters.marks ?? []).map((m) => (
              <option key={m.value} value={String(m.value)}>
                {m.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Результаты */}
      <div className="mt-5 max-h-[420px] overflow-y-auto rounded-sct border border-borderLight">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Spinner />
          </div>
        ) : !data || data.results.length === 0 ? (
          <div className="p-10 text-center text-sm font-bold text-textSecondary">
            Ничего не нашлось. Попробуйте сбросить фильтры.
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
                    <p className="truncate text-sm font-900 uppercase italic tracking-tight text-textPrimary">
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
