/**
 * Горизонтальная плашка рекомендации сервиса (по дизайну).
 *
 * Лёгкая, single-line: иконка слева → подпись «Рекомендация сервиса /
 * следующая замена масла в ДВС» → справа крупно пробег следующей замены
 * («14 000 км»). Бэк отдаёт рекомендацию в service_recommendations.engine_oil
 * (последняя замена + interval_km).
 *
 * Если рекомендации нет (например, не было прошлой замены) — не рендерим.
 */
import { Card } from '@/shared/ui/Card'
import { formatMileage } from '@/shared/lib/format'
import type { EngineOilRecommendation } from './types'

interface RecommendationStripProps {
  recommendation: EngineOilRecommendation | null | undefined
}

export function RecommendationStrip({ recommendation }: RecommendationStripProps) {
  if (!recommendation || recommendation.next_service_mileage_km == null) return null
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
            {recommendation.title || 'Рекомендация сервиса'}
          </p>
          <p className="mt-0.5 text-[12px] font-bold uppercase tracking-tight text-textSecondary">
            Следующая замена масла в ДВС
          </p>
          {recommendation.last_service_mileage_km != null && (
            <p className="mt-0.5 text-[10px] text-textSecondary/70">
              последняя замена — {formatMileage(recommendation.last_service_mileage_km)}
            </p>
          )}
        </div>
      </div>
      <p className="text-right text-xl font-900 leading-none tracking-tighter text-brandBlue md:text-2xl">
        {formatMileage(recommendation.next_service_mileage_km)}
      </p>
    </Card>
  )
}
