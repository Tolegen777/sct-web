/**
 * Шаг 2: выбор модели для выбранной марки.
 */
import { useMemo, useState } from 'react'
import { useModelsQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import type { Mark, Model } from './types'

interface ModelStepProps {
  mark: Mark
  selectedModelId: number | null
  onSelect: (model: Model) => void
}

const INITIAL_LIMIT = 6

export function ModelStep({ mark, selectedModelId, onSelect }: ModelStepProps) {
  const { data, isLoading, isError } = useModelsQuery(mark.id)
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!data?.results) return []
    if (!q) return data.results
    return data.results.filter((m) =>
      [m.name, m.name_ru, m.display_name].some((v) => v?.toLowerCase().includes(q)),
    )
  }, [data, q])

  // При поиске/раскрытии — всё, иначе первые INITIAL_LIMIT.
  const visible = q || showAll ? filtered : filtered.slice(0, INITIAL_LIMIT)
  const canExpand = !q && !showAll && filtered.length > visible.length

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="rounded-sct border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Не удалось загрузить список моделей.
      </div>
    )
  }

  return (
    <div>
      <Input
        label="Выбор модели"
        placeholder="Начните вводить модель…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((model) => {
          const isActive = model.id === selectedModelId
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelect(model)}
              className={cn(
                'rounded-sct border bg-white p-4 text-left transition-all',
                isActive
                  ? 'border-brandBlue bg-blue-50/40 shadow-soft-blue'
                  : 'border-borderLight hover:-translate-y-0.5 hover:border-brandBlue/40 hover:shadow-sct-soft',
              )}
            >
              <p className="text-sm font-900 uppercase tracking-tight text-textPrimary">
                {model.name}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                {model.year_from} – {model.year_to} • {model.modifications_count} модиф.
              </p>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-5 rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
          <p className="text-sm font-bold text-textSecondary">Модели не найдены.</p>
        </div>
      )}

      {canExpand && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-sct border-2 border-dashed border-borderLight py-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary transition-all hover:border-brandBlue hover:text-brandBlue"
        >
          Показать все модели ({filtered.length})
        </button>
      )}
    </div>
  )
}
