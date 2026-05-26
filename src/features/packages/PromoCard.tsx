/**
 * Компактная промо-карточка пакета. По дизайну:
 *   - жёлтая полоса-уголок сверху ("акция" маркер)
 *   - мелкий заголовок-категория (Castrol Edge 5W-30 Titanium)
 *   - подзаголовок (название пакета)
 *   - крупное фото 3:4 (бутылка масла)
 *   - цена внизу слева, синяя пилюля "Подробнее" справа
 *
 * Используется в секциях «Акции» и «Спецпредложения». Узкая — 4 в ряд
 * на десктопе.
 */
import { Link } from 'react-router-dom'
import type { ClientServicePackage } from '@/shared/api/types'
import { SafeImage } from '@/shared/ui/SafeImage'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from './lib'

interface PromoCardProps {
  pkg: ClientServicePackage
}

export function PromoCard({ pkg }: PromoCardProps) {
  const title = getPackageShortTitle(pkg)
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-sct border border-borderLight bg-white transition-all hover:-translate-y-1 hover:border-brandBlue/50 hover:shadow-soft-card">
      {/* Жёлтая полоса-уголок */}
      <div className="h-1.5 w-full bg-brandYellow" />

      <div className="flex flex-1 flex-col p-4">
        {/* Категория */}
        <p className="text-[9px] font-900 uppercase tracking-widest text-textSecondary">
          {pkg.category.name}
        </p>
        {/* Название пакета */}
        <h3 className="mt-1 line-clamp-2 text-[12px] font-900 uppercase italic leading-tight tracking-tight text-textPrimary">
          {title}
        </h3>

        {/* Фото 3:4 */}
        <div className="mt-3 aspect-[3/4] overflow-hidden rounded-sct border border-borderLight bg-surfaceLight">
          <SafeImage
            src={pkg.image_url || undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center bg-blue-50 text-4xl">
                🛢️
              </div>
            }
          />
        </div>

        {/* Цена + кнопка */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-lg font-900 italic tracking-tighter text-textPrimary">
            {formatMoney(pkg.final_price, pkg.currency)}
          </p>
          <Link
            to={`/services/${pkg.id}`}
            className="rounded-md bg-brandBlue px-3 py-1.5 text-[10px] font-900 uppercase tracking-widest text-white transition-all hover:bg-brandBlueDark"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </article>
  )
}
