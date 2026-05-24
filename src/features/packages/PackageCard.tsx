/**
 * Карточка одного пакета услуги в списке.
 *
 * Слева — текст (категория-бейдж, название, краткое описание, цена),
 * справа — обложка 3:4 (через SafeImage). Если у пакета has_promotion —
 * сверху-справа жёлтый бейдж «Акция».
 */
import { Link } from 'react-router-dom'
import type { ClientServicePackage } from '@/shared/api/types'
import { SafeImage } from '@/shared/ui/SafeImage'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from './lib'

interface PackageCardProps {
  pkg: ClientServicePackage
}

export function PackageCard({ pkg }: PackageCardProps) {
  const title = getPackageShortTitle(pkg)
  const hasDiscount = pkg.discount_type !== 'NONE'
  return (
    <Link
      to={`/services/${pkg.id}`}
      className="group block overflow-hidden rounded-sct-lg border border-borderLight bg-white p-5 transition-all hover:-translate-y-1 hover:border-brandBlue hover:shadow-soft-card md:p-6"
    >
      {pkg.has_promotion && (
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="rounded-md bg-brandOrange px-2 py-0.5 text-[10px] font-900 uppercase tracking-widest text-white">
            Акция
          </span>
          {pkg.promotion_title && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-brandOrange">
              {pkg.promotion_title}
            </span>
          )}
        </div>
      )}

      <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
        {pkg.category.name}
      </p>
      <h3 className="mt-2 text-lg font-900 uppercase italic leading-tight tracking-tight text-textPrimary transition-colors group-hover:text-brandBlue md:text-xl">
        {title}
      </h3>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <div className="col-span-7 flex flex-col md:col-span-8">
          {pkg.short_description && (
            <p className="text-sm font-medium text-textSecondary line-clamp-3">
              {pkg.short_description}
            </p>
          )}
          <div className="mt-auto pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">
              {pkg.items_count > 0 ? `В пакете: ${pkg.items_count} поз.` : 'Без состава'}
            </p>
          </div>
        </div>

        <div className="col-span-5 flex flex-col items-center md:col-span-4">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-sct border border-borderLight bg-surfaceLight">
            <SafeImage
              src={pkg.image_url || undefined}
              alt={title}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-3xl">
                  🛠️
                </div>
              }
            />
          </div>
          <div className="mt-3 w-full text-right">
            <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
              Цена
            </p>
            <p className="text-xl font-900 italic leading-none tracking-tighter text-textPrimary md:text-2xl">
              {formatMoney(pkg.final_price, pkg.currency)}
            </p>
            {hasDiscount && (
              <p className="mt-1 text-[10px] font-bold uppercase text-textSecondary/60 line-through">
                {formatMoney(pkg.base_total, pkg.currency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
