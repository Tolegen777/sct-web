/**
 * Три плашки активного авто: Пробег / Замена масла / Ближайший визит.
 *
 * Вынесено в общий компонент по правке заказчика: раньше эти плашки жили
 * только внутри ActiveCarBlock на «Главной», а на странице «Авто» их не было —
 * «пусть он тоже просто будет». Теперь один компонент на обоих экранах, так
 * что разъехаться по вёрстке они больше не могут (то же решение, что и в
 * мобильном приложении).
 *
 * Данные берём сами из service-book/page-data — запрос уже в кэше на обоих
 * экранах, лишнего обращения к сети не будет.
 */
import { useServiceBookQuery } from './queries'
import { findRecommendation } from './recommendations'
import { formatDateTime, formatMileage } from '@/shared/lib/format'

export function CarSpecChips() {
  const { data } = useServiceBookQuery({})
  const car = data?.selected_car
  if (!car) return null

  const engineOil = findRecommendation(data?.service_recommendations?.recommendations, 'engine_oil')
  const next = data?.next_appointment
  const nextDt = next?.final_datetime ?? next?.scheduled_datetime ?? next?.preferred_datetime
  const hasMileage = typeof car.latest_mileage_km === 'number' && car.latest_mileage_km > 0

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3">
      <SpecChip label="Пробег" value={hasMileage ? formatMileage(car.latest_mileage_km) : '—'} />
      <SpecChip
        label="Замена масла"
        value={
          engineOil?.next_service_mileage_km != null
            ? formatMileage(engineOil.next_service_mileage_km)
            : '—'
        }
      />
      <SpecChip
        label="Ближайший визит"
        value={nextDt ? formatDateTime(nextDt) : 'Нет'}
        accent={Boolean(nextDt)}
      />
    </div>
  )
}

function SpecChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-sct border border-borderLight bg-surfaceLight px-3 py-2.5">
      {/* Две строки под подпись: «Ближайший визит» и «Замена масла» в одну
          строку не влезают на узких экранах и обрезаются, а из-за разной длины
          подписи значения вставали на разной высоте. */}
      <p className="min-h-[1.6rem] text-[9px] font-900 uppercase leading-[0.8rem] tracking-wide text-textSecondary">
        {label}
      </p>
      <p
        className={
          'mt-1 truncate text-base font-900 leading-none tracking-tighter ' +
          (accent ? 'text-brandBlue' : 'text-textPrimary')
        }
      >
        {value}
      </p>
    </div>
  )
}
