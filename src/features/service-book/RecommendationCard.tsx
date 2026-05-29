/**
 * Карточка рекомендации сервиса.
 *
 * По ответу ПМа: пока есть только одна рекомендация — замена масла в ДВС,
 * вычисляется как `последняя_замена_масла + 8000 км`. Это значение бэк уже
 * подсчитывает и кладёт в summary.next_service_date.
 *
 * Если next_service_date пуст — не показываем карточку вовсе (нечего
 * рекомендовать пока).
 */
import { formatDate } from '@/shared/lib/format'

interface RecommendationCardProps {
  nextServiceDate: string | null
  lastServiceDate: string | null
}

export function RecommendationCard({ nextServiceDate, lastServiceDate }: RecommendationCardProps) {
  if (!nextServiceDate) return null
  return (
    <div className="relative overflow-hidden rounded-sct-lg border-2 border-brandBlue/20 bg-surfaceLight p-6 transition-all hover:border-brandBlue/40">
      <div className="absolute right-0 top-0 bottom-0 hidden w-24 items-center justify-center bg-brandBlue/5 md:flex">
        <svg className="h-12 w-12 rotate-12 text-brandBlue/20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1-11V7h2v4h-2zm0 6v-2h2v2h-2z" />
        </svg>
      </div>
      <div className="relative z-10 flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-brandBlue shadow-md">
            ⏳
          </div>
          <div>
            <h3 className="text-sm font-900 uppercase tracking-tight text-textPrimary">
              Рекомендация сервиса
            </h3>
            <p className="mt-1 text-[11px] font-bold uppercase text-textSecondary">
              Замена масла в двигателе
            </p>
            {lastServiceDate && (
              <p className="mt-1 text-[10px] text-textSecondary/80">
                Последняя замена — {formatDate(lastServiceDate)}
              </p>
            )}
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            Запланировано на
          </p>
          <p className="text-2xl font-900 leading-none text-brandBlue">
            {formatDate(nextServiceDate)}
          </p>
        </div>
      </div>
    </div>
  )
}
