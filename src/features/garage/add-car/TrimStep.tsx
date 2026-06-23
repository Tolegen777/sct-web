/**
 * Шаг 5 «Комплектация» (бэк ввёл разделение модификация → комплектации).
 *
 * Тянет комплектации выбранной модификации (`/cars/trims/?modification={id}`).
 * Если комплектация одна — выбираем её автоматически и проскакиваем шаг
 * (родитель уводит на «Номер»). Если несколько — показываем список; тап по
 * комплектации сразу ведёт дальше. Выбранный `trim.source_id` уходит в
 * create как `modification_trim_source_id`.
 */
import { useEffect } from 'react'
import { useTrimsQuery } from './queries'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import type { Trim } from './types'

interface TrimStepProps {
  modificationId: number
  selectedTrimSourceId: string | null
  onSelect: (trim: Trim) => void
}

export function TrimStep({ modificationId, selectedTrimSourceId, onSelect }: TrimStepProps) {
  const { data: trims, isLoading, isError } = useTrimsQuery(modificationId)

  // Одна комплектация → выбираем автоматически и пропускаем шаг.
  useEffect(() => {
    if (trims && trims.length === 1 && !selectedTrimSourceId) {
      onSelect(trims[0])
    }
  }, [trims, selectedTrimSourceId, onSelect])

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-sct border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Не удалось загрузить комплектации. Вернитесь и выберите модификацию заново.
      </div>
    )
  }

  const items = trims ?? []

  if (items.length === 0) {
    return (
      <div className="rounded-sct border border-borderLight bg-surfaceLight p-8 text-center">
        <p className="text-sm font-bold text-textSecondary">
          Для этой модификации нет комплектаций.
        </p>
      </div>
    )
  }

  // Одна комплектация — её выберет эффект выше; пока показываем спиннер,
  // чтобы не мигал список из одного элемента.
  if (items.length === 1) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <h3 className="mb-4 text-[12px] font-900 uppercase tracking-widest text-textSecondary">
        Комплектация
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((t) => {
          const active = t.source_id === selectedTrimSourceId
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className={cn(
                'flex items-center justify-between gap-3 rounded-sct border bg-white p-4 text-left transition-all',
                active
                  ? 'border-brandBlue bg-blue-50/40 shadow-soft-blue'
                  : 'border-borderLight hover:-translate-y-0.5 hover:border-brandBlue/40 hover:shadow-sct-soft',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-900 uppercase tracking-tight text-textPrimary">
                  {t.display_name || t.name || 'Комплектация'}
                </span>
                {t.is_closed && (
                  <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-widest text-textSecondary/70">
                    Снята с производства
                  </span>
                )}
              </span>
              <svg
                className={cn('h-5 w-5 shrink-0', active ? 'text-brandBlue' : 'text-borderLight')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
