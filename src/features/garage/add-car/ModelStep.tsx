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

export function ModelStep({ mark, selectedModelId, onSelect }: ModelStepProps) {
  const { data, isLoading, isError } = useModelsQuery(mark.id)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!data?.results) return []
    const q = search.trim().toLowerCase()
    if (!q) return data.results
    return data.results.filter((m) =>
      [m.name, m.name_ru, m.display_name].some((v) => v?.toLowerCase().includes(q)),
    )
  }, [data, search])

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
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            Выберите модель
          </h2>
          <p className="mt-2 text-sm text-textSecondary">
            {mark.display_name} — найдено {data.count} моделей
          </p>
        </div>
      </div>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Поиск по модели…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
        {filtered.map((model) => {
          const isActive = model.id === selectedModelId
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => onSelect(model)}
              className={cn(
                'rounded-sct border-2 bg-white p-4 text-left transition-all',
                isActive
                  ? 'border-brandBlue bg-blue-50/40 shadow-soft-blue'
                  : 'border-transparent hover:-translate-y-1 hover:border-borderLight hover:shadow-sct-soft',
              )}
            >
              <p className="text-sm font-900 uppercase italic tracking-tight text-textPrimary">
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
        <div className="rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
          <p className="text-sm font-bold text-textSecondary">
            Модели не найдены.
          </p>
        </div>
      )}
    </div>
  )
}
