/**
 * Шаг 1: выбор марки (по дизайну new_screens).
 *
 * «Поиск марки» (input) + грид логотипов. По умолчанию показываем только
 * популярные марки (is_popular) + кнопку «Показать все марки». При вводе
 * в поиск показываем все совпадения и прячем кнопку.
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

const FALLBACK_LIMIT = 8

export function MarkStep({ selectedMarkId, onSelect }: MarkStepProps) {
  const { data, isLoading, isError } = useMarksQuery()
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

  const popular = useMemo(() => filtered.filter((m) => m.is_popular), [filtered])

  // Что показываем: при поиске/раскрытии — всё, иначе только популярные
  // (или первые N, если бэк не разметил популярные).
  const visible = q || showAll ? filtered : popular.length > 0 ? popular : filtered.slice(0, FALLBACK_LIMIT)
  const canExpand =
    !q &&
    !showAll &&
    (popular.length > 0 ? filtered.length > popular.length : filtered.length > FALLBACK_LIMIT)

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
      <Input
        label="Поиск марки"
        placeholder="Например BMW…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-5 grid grid-cols-3 gap-3 lg:grid-cols-4">
        {visible.map((mark) => (
          <MarkCard
            key={mark.id}
            mark={mark}
            active={mark.id === selectedMarkId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-5 rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
          <p className="text-sm font-bold text-textSecondary">
            По запросу «{search}» марки не найдены.
          </p>
        </div>
      )}

      {canExpand && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-sct border-2 border-dashed border-borderLight py-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary transition-all hover:border-brandBlue hover:text-brandBlue"
        >
          Показать все марки
        </button>
      )}
    </div>
  )
}

function MarkCard({
  mark,
  active,
  onSelect,
}: {
  mark: Mark
  active: boolean
  onSelect: (m: Mark) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(mark)}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-sct border bg-white p-5 transition-all',
        active
          ? 'border-brandBlue shadow-soft-blue'
          : 'border-borderLight hover:-translate-y-0.5 hover:border-brandBlue/40 hover:shadow-sct-soft',
      )}
    >
      <SafeImage
        src={mark.logo_url}
        alt={mark.name}
        className="h-12 w-12 object-contain"
        fallback={
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surfaceLight text-[11px] font-900 uppercase text-textSecondary">
            {mark.name.slice(0, 2)}
          </div>
        }
      />
      <span className="text-[12px] font-900 uppercase tracking-tight text-textPrimary">
        {mark.name}
      </span>
    </button>
  )
}
