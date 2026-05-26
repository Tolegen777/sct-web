/**
 * Горизонтальная плашка рекомендации сервиса.
 *
 * Лёгкая, single-line: иконка слева → подпись «Рекомендация сервиса /
 * следующая замена масла в ДВС» → справа крупно «59 000 км» (значение).
 *
 * Если бэк не отдал next_service_date — компонент не рендерим.
 */
import { Card } from '@/shared/ui/Card'
import { formatDate } from '@/shared/lib/format'

interface RecommendationStripProps {
  nextServiceDate: string | null
}

export function RecommendationStrip({ nextServiceDate }: RecommendationStripProps) {
  if (!nextServiceDate) return null
  return (
    <Card className="flex items-center justify-between gap-4 border-blue-100 bg-blue-50/40 px-5 py-4 md:px-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brandBlue/10 text-brandBlue">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
            Рекомендация сервиса
          </p>
          <p className="mt-0.5 text-[12px] font-bold uppercase tracking-tight text-textSecondary">
            Следующая замена масла в ДВС
          </p>
        </div>
      </div>
      <p className="text-right text-xl font-900 italic leading-none tracking-tighter text-brandBlue md:text-2xl">
        {formatDate(nextServiceDate)}
      </p>
    </Card>
  )
}
