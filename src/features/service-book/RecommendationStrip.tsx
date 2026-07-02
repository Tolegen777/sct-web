/**
 * Список рекомендаций сервиса (по дизайну — стопка компактных плашек).
 *
 * Бэк (сверено на dev 2026-07-02) отдаёт набор в
 * service_recommendations.recommendations[] — по объекту на вид обслуживания
 * (масло ДВС/АКПП, тормозная жидкость, антифриз…). Показываем по срочности:
 * сначала «уже пора» (is_due), затем по остатку пробега. Цвет и подпись берём
 * из category. Если рекомендаций нет (клиент без истории) — не рендерим.
 */
import { formatMileage } from '@/shared/lib/format'
import type { ServiceRecommendations } from './types'
import { sortRecommendationsByUrgency } from './recommendations'

interface RecommendationStripProps {
  recommendations: ServiceRecommendations | null | undefined
}

export function RecommendationStrip({ recommendations }: RecommendationStripProps) {
  const items = sortRecommendationsByUrgency(recommendations?.recommendations ?? [])
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {items.map((rec) => {
        const color = rec.category?.color || '#1F5FAF'
        return (
          <div
            key={rec.code}
            className="flex items-center justify-between gap-4 rounded-sct border border-borderLight border-l-4 bg-white px-5 py-4 shadow-sct-soft md:px-6"
            style={{ borderLeftColor: color }}
          >
            <div className="min-w-0">
              <p
                className="text-[10px] font-900 uppercase tracking-widest"
                style={{ color }}
              >
                {rec.is_due ? 'Пора обслужить' : 'Рекомендация сервиса'}
              </p>
              <p className="mt-0.5 truncate text-[13px] font-bold uppercase tracking-tight text-textPrimary">
                {rec.category?.name || rec.title}
              </p>
              {rec.last_service?.mileage_km != null && (
                <p className="mt-0.5 text-[10px] text-textSecondary/70">
                  последняя замена — {formatMileage(rec.last_service.mileage_km)}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {rec.next_service_mileage_km != null && (
                <p
                  className="text-lg font-900 leading-none tracking-tighter md:text-xl"
                  style={{ color }}
                >
                  {formatMileage(rec.next_service_mileage_km)}
                </p>
              )}
              {!rec.is_due && rec.remaining_mileage_km != null && (
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                  осталось ~{formatMileage(rec.remaining_mileage_km)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
