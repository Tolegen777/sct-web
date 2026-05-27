/**
 * Секция «Популярные услуги» на главной — 6 карточек в ряд (3 на md, 2 на mobile).
 *
 * Используется то же `usePackagesQuery`, но в виде упрощённых «услуг»:
 * иконка категории + название + «от X ₸» + кнопка «Записаться».
 *
 * В отличие от FeaturedPackagesSection (где показываем акции/избранные),
 * здесь — обычные regular_packages, отсортированные по sort_order.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePackagesQuery } from '@/features/packages/queries'
import { Skeleton } from '@/shared/ui/Skeleton'
import { formatMoney } from '@/shared/lib/format'
import type { ClientServicePackage } from '@/shared/api/types'

const MAX_ITEMS = 6

export function PopularServicesSection() {
  const { data, isLoading } = usePackagesQuery()

  const items = useMemo(() => {
    if (!data?.regular_packages) return []
    return [...data.regular_packages]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .slice(0, MAX_ITEMS)
  }, [data])

  if (isLoading) {
    return (
      <Section title="Популярные услуги">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton.Card key={i} className="h-32" />
          ))}
        </div>
      </Section>
    )
  }

  if (items.length === 0) return null

  return (
    <Section
      title="Популярные услуги"
      subtitle="Простые услуги без пакетной комплектации. Цена зависит от автомобиля, расходников и объёма работ"
      action={
        <Link
          to="/services"
          className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Все услуги →
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {items.map((pkg) => (
          <ServiceRow key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </Section>
  )
}

function ServiceRow({ pkg }: { pkg: ClientServicePackage }) {
  // Короткое название категории (вместо длинного «Замена масла Camry...»)
  const shortTitle = pkg.category?.name ?? pkg.title

  return (
    <article className="flex items-center justify-between gap-4 rounded-sct border border-borderLight bg-white p-4 transition-all hover:border-brandBlue/40 hover:shadow-soft-card md:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brandBlue">
          <CategoryIcon code={pkg.category?.code} />
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-1 text-sm font-900 uppercase italic tracking-tight text-textPrimary md:text-base">
            {shortTitle}
          </h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-textSecondary">
            от
            <span className="ml-1 text-brandBlue">
              {formatMoney(pkg.final_price, pkg.currency)}
            </span>
          </p>
        </div>
      </div>

      <Link
        to={`/services/${pkg.id}/book`}
        className="shrink-0 rounded-md bg-brandBlue px-3 py-2 text-[10px] font-900 uppercase tracking-widest text-white shadow-soft-blue transition-all hover:bg-brandBlueDark"
      >
        Записаться
      </Link>
    </article>
  )
}

function CategoryIcon({ code }: { code?: string }) {
  const path =
    code === 'engine_oil' || code === 'transmission_oil'
      ? 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
      : code === 'maintenance'
      ? 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z'
      : 'M13 10V3L4 14h7v7l9-11h-7z'
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h2 className="text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[12px] font-medium italic text-textSecondary">
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
