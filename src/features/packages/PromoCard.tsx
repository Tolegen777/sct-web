/**
 * Промо-карточка пакета (секции «Акции» и «Спецпредложения»), по дизайну:
 *   - фото товара сверху, бейдж «Акция» в углу (если has_promotion);
 *   - название пакета;
 *   - итоговая цена + зачёркнутая цена до скидки (base_total).
 *
 * Используется внутри горизонтальной карусели на /services.
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
  const showOld = Number(pkg.base_total) > Number(pkg.final_price)

  return (
    <Link
      to={`/services/${pkg.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-sct border border-borderLight bg-white transition-all hover:-translate-y-1 hover:border-brandBlue/50 hover:shadow-soft-card"
    >
      <div className="relative aspect-square bg-surfaceLight">
        {pkg.has_promotion && (
          <span className="absolute left-3 top-3 z-10 rounded-md bg-brandYellow px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-textPrimary">
            Акция
          </span>
        )}
        <SafeImage
          src={pkg.image_url || undefined}
          alt={title}
          className="h-full w-full object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-blue-50 text-textSecondary">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          }
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[9px] font-900 uppercase tracking-widest text-textSecondary">
          {pkg.category.name}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[13px] font-900 uppercase leading-tight tracking-tight text-textPrimary">
          {title}
        </h3>
        {pkg.short_description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-snug text-textSecondary">
            {pkg.short_description}
          </p>
        )}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span className="text-lg font-900 tracking-tighter text-textPrimary">
            {formatMoney(pkg.final_price, pkg.currency)}
          </span>
          {showOld && (
            <span className="text-xs font-bold text-textSecondary/60 line-through">
              {formatMoney(pkg.base_total, pkg.currency)}
            </span>
          )}
        </div>

        <span className="mt-3 inline-flex items-center justify-center rounded-md bg-brandBlue px-3 py-2 text-[10px] font-900 uppercase tracking-widest text-white transition-colors group-hover:bg-brandBlueDark">
          Подробнее
        </span>
      </div>
    </Link>
  )
}
