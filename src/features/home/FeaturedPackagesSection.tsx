/**
 * Секция «Спецпредложения по пакетам» на главной.
 *
 * 4 карточки в ряд (3 на mid, 2 на mobile) — берём из `promotional_packages`
 * + помеченных `is_featured` regular_packages, если первых меньше 4.
 *
 * Каждая карточка компактнее чем `PromoCard` со страницы услуг — без
 * длинного описания, только иконка категории, краткое название и цена.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePackagesQuery } from '@/features/packages/queries'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from '@/features/packages/lib'
import type { ClientServicePackage } from '@/shared/api/types'

const MAX_ITEMS = 4

export function FeaturedPackagesSection() {
  const { data, isLoading } = usePackagesQuery()

  const items = useMemo(() => {
    if (!data) return []
    // Сначала акционные, потом избранные regular, потом просто regular.
    const promo = data.promotional_packages ?? []
    const featured = (data.regular_packages ?? []).filter((p) => p.is_featured)
    const others = (data.regular_packages ?? []).filter((p) => !p.is_featured)
    return [...promo, ...featured, ...others].slice(0, MAX_ITEMS)
  }, [data])

  if (isLoading) {
    return (
      <Section title="Спецпредложения по пакетам" subtitle="Подобраны под ваш активный автомобиль">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton.Card key={i} className="h-48" />
          ))}
        </div>
      </Section>
    )
  }

  if (items.length === 0) return null

  return (
    <Section
      title="Спецпредложения по пакетам"
      subtitle="Подобраны под ваш активный автомобиль"
      action={
        <Link
          to="/services"
          className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Все пакеты →
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {items.map((pkg) => (
          <FeaturedCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </Section>
  )
}

function FeaturedCard({ pkg }: { pkg: ClientServicePackage }) {
  const title = getPackageShortTitle(pkg)
  const hasDiscount = pkg.discount_type !== 'NONE'
  return (
    <Link
      to={`/services/${pkg.id}`}
      className="group relative flex flex-col rounded-sct border border-borderLight bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brandBlue hover:shadow-soft-card"
    >
      {pkg.has_promotion && (
        <span className="absolute right-0 top-0 rounded-bl-md rounded-tr-sct bg-brandYellow px-2 py-0.5 text-[9px] font-900 uppercase tracking-widest text-textPrimary">
          −20%
        </span>
      )}

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brandBlue">
        <CategoryIcon code={pkg.category?.code} />
      </div>

      <p className="text-[9px] font-900 uppercase tracking-widest text-brandBlue line-clamp-1">
        {pkg.category?.name}
      </p>
      <h3 className="mt-1 line-clamp-2 text-sm font-900 uppercase leading-tight text-textPrimary md:text-base">
        {title}
      </h3>

      <div className="mt-auto pt-4">
        {hasDiscount && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-textSecondary/60 line-through">
            {formatMoney(pkg.base_total, pkg.currency)}
          </p>
        )}
        <p className="text-lg font-900 leading-none tracking-tighter text-textPrimary md:text-xl">
          {formatMoney(pkg.final_price, pkg.currency)}
        </p>
      </div>
    </Link>
  )
}

function CategoryIcon({ code }: { code?: string }) {
  // 4 встроенных категории на бэке: engine_oil, transmission_oil,
  // maintenance, diagnostics. Для остальных — fallback на «гаечный ключ».
  const path =
    code === 'engine_oil' || code === 'transmission_oil'
      ? 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
      : code === 'maintenance'
      ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z'
      : 'M13 10V3L4 14h7v7l9-11h-7z'
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  )
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <header className="mb-4 flex items-end justify-between gap-3 md:mb-5">
        <div>
          <h2 className="text-xl font-900 uppercase tracking-tight text-textPrimary md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[12px] font-medium text-textSecondary">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

// Card unused — оставлено как утилита (если позже добавим вариант
// «пустой» секции, чтобы не плодить местные пустые состояния).
export { Card as _Unused }
