/**
 * Шаг 4: выбор конкретной модификации из отфильтрованного списка.
 * Если фильтры пустые — список может быть очень большим. Пагинацию делаем
 * через `page` параметр (бэк отдаёт стандартную DRF-пагинацию).
 */
import { useMemo } from 'react'
import { useModificationsQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import type { CarsQuery, Modification } from './types'
import type { SpecsValues } from './SpecsStep'

interface ModificationStepProps {
  markId: number
  modelId: number
  specs: SpecsValues
  selectedSourceId: string | null
  onSelect: (modification: Modification) => void
  page: number
  onPageChange: (page: number) => void
}

const PAGE_SIZE = 20

export function ModificationStep({
  markId,
  modelId,
  specs,
  selectedSourceId,
  onSelect,
  page,
  onPageChange,
}: ModificationStepProps) {
  const query: CarsQuery = useMemo(
    () => ({ mark: markId, model: modelId, ...specs, page, page_size: PAGE_SIZE }),
    [markId, modelId, specs, page],
  )
  const { data, isLoading, isError } = useModificationsQuery(query)

  const items: Modification[] = useMemo(() => {
    if (!data) return []
    return data.results ?? []
  }, [data])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="rounded-sct border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Не удалось загрузить модификации.
      </div>
    )
  }

  const totalPages = data ? Math.ceil((data.count ?? 0) / PAGE_SIZE) : 1

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          Выберите модификацию
        </h2>
        <p className="mt-2 text-sm text-textSecondary">
          Найдено модификаций: {(data?.count ?? 0).toLocaleString('ru-RU')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((m) => {
          const isActive = m.source_id === selectedSourceId
          const title =
            (typeof m.display_name === 'string' && m.display_name) ||
            (typeof m.title === 'string' && m.title) ||
            (typeof m.name === 'string' && m.name) ||
            `Модификация ${m.id}`
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m)}
              className={cn(
                'rounded-sct border-2 bg-white p-4 text-left transition-all',
                isActive
                  ? 'border-brandBlue bg-blue-50/40 shadow-soft-blue'
                  : 'border-transparent hover:border-borderLight hover:shadow-sct-soft',
              )}
            >
              <p className="text-sm font-900 uppercase italic tracking-tight text-textPrimary">
                {title}
              </p>
              {(m.year_from || m.year_to) && (
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-textSecondary">
                  {m.year_from ?? ''}{m.year_to ? ` – ${m.year_to}` : ''}
                </p>
              )}
            </button>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
          <p className="text-sm font-bold text-textSecondary">
            Под выбранные параметры модификации не найдены. Уберите часть фильтров.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-textSecondary disabled:opacity-40 hover:border-brandBlue hover:text-brandBlue"
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
            className="rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-textSecondary disabled:opacity-40 hover:border-brandBlue hover:text-brandBlue"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  )
}
