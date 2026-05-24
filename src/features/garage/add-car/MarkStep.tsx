/**
 * Шаг 1: выбор марки. Грид с логотипами + поиск по названию.
 * Сверху — «Популярные» (is_popular=true), внизу — все остальные.
 */
import { useMemo, useState } from 'react'
import { useMarksQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Input } from '@/shared/ui/Input'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import type { Mark } from './types'

interface MarkStepProps {
  selectedMarkId: number | null
  onSelect: (mark: Mark) => void
}

export function MarkStep({ selectedMarkId, onSelect }: MarkStepProps) {
  const { data, isLoading, isError } = useMarksQuery()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!data?.results) return []
    const q = search.trim().toLowerCase()
    if (!q) return data.results
    return data.results.filter((m) =>
      [m.name, m.name_ru, m.display_name].some((v) => v?.toLowerCase().includes(q)),
    )
  }, [data, search])

  const popular = filtered.filter((m) => m.is_popular)
  const others = filtered.filter((m) => !m.is_popular)

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
        Не удалось загрузить список марок.
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          Выберите марку
        </h2>
        <p className="mt-2 text-sm text-textSecondary">
          В каталоге {data.count.toLocaleString('ru-RU')} марок
        </p>
      </div>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Поиск по марке…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {popular.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-[11px] font-900 uppercase tracking-widest text-textSecondary">
            Популярные
          </h3>
          <MarkGrid items={popular} selected={selectedMarkId} onSelect={onSelect} />
        </section>
      )}

      {others.length > 0 && (
        <section>
          {popular.length > 0 && (
            <h3 className="mb-3 text-[11px] font-900 uppercase tracking-widest text-textSecondary">
              Все марки ({others.length})
            </h3>
          )}
          <MarkGrid items={others} selected={selectedMarkId} onSelect={onSelect} />
        </section>
      )}

      {filtered.length === 0 && (
        <div className="rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
          <p className="text-sm font-bold text-textSecondary">
            По запросу «{search}» марки не найдены.
          </p>
        </div>
      )}
    </div>
  )
}

function MarkGrid({
  items,
  selected,
  onSelect,
}: {
  items: Mark[]
  selected: number | null
  onSelect: (m: Mark) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 md:gap-3">
      {items.map((mark) => {
        const isActive = mark.id === selected
        return (
          <button
            key={mark.id}
            type="button"
            onClick={() => onSelect(mark)}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-sct border-2 bg-white p-3 transition-all',
              isActive
                ? 'border-brandBlue bg-blue-50/40 shadow-soft-blue'
                : 'border-transparent hover:-translate-y-1 hover:border-borderLight hover:shadow-sct-soft',
            )}
          >
            <SafeImage
              src={mark.logo_url}
              alt={mark.name}
              className="h-10 w-10 object-contain"
              fallback={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surfaceLight text-[10px] font-900 uppercase text-textSecondary">
                  {mark.name.slice(0, 2)}
                </div>
              }
            />

            <span className="text-[11px] font-900 uppercase tracking-tight text-textPrimary">
              {mark.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
