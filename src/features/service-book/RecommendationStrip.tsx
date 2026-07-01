/**
 * Горизонтальная плашка рекомендации сервиса (по дизайну).
 *
 * Лёгкая, single-line: иконка слева → подпись «Рекомендация сервиса /
 * следующая замена масла в ДВС» → справа крупно пробег следующей замены
 * («14 000 км»).
 *
 * Бэк (сверено на dev 2026-07-01) отдаёт целевой пробег в
 * service_recommendations.next_oil_change_mileage_km. Если его нет
 * (не было прошлой замены / нет данных о пробеге) — не рендерим.
 */
import { Card } from '@/shared/ui/Card'
import { formatMileage } from '@/shared/lib/format'
import type { ServiceRecommendations } from './types'

interface RecommendationStripProps {
  recommendations: ServiceRecommendations | null | undefined
}

export function RecommendationStrip({ recommendations }: RecommendationStripProps) {
  const nextKm = recommendations?.next_oil_change_mileage_km
  if (nextKm == null) return null
  const latestKm = recommendations?.latest_mileage_km
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
          {latestKm != null && (
            <p className="mt-0.5 text-[10px] text-textSecondary/70">
              текущий пробег — {formatMileage(latestKm)}
            </p>
          )}
        </div>
      </div>
      <p className="text-right text-xl font-900 leading-none tracking-tighter text-brandBlue md:text-2xl">
        {formatMileage(nextKm)}
      </p>
    </Card>
  )
}
