/**
 * Карточка обычной услуги (раздел «Все услуги»).
 *
 * По дизайну — простая: иконка категории в кружке, название услуги,
 * «от 5 000 ₸», тёмная кнопка «ВЫБРАТЬ УСЛУГУ». 3 в ряд на десктопе.
 *
 * Иконку маппим по `category.code` — для каждой категории своя. Если не
 * нашли — generic-шестерёнка.
 */
import { Link } from 'react-router-dom'
import type { ClientServicePackage } from '@/shared/api/types'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from './lib'

interface ServiceCardProps {
  pkg: ClientServicePackage
}

export function ServiceCard({ pkg }: ServiceCardProps) {
  const title = getPackageShortTitle(pkg)
  return (
    <article className="group flex flex-col rounded-sct border border-borderLight bg-white p-5 transition-all hover:-translate-y-1 hover:border-brandBlue/50 hover:shadow-soft-card">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-brandBlue">
        <CategoryIcon code={pkg.category.code} />
      </div>

      <p className="text-[9px] font-900 uppercase tracking-widest text-textSecondary">
        {pkg.category.name}
      </p>
      <h3 className="mt-1 line-clamp-2 text-base font-900 uppercase italic leading-tight tracking-tight text-textPrimary">
        {title}
      </h3>

      <div className="mt-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-textSecondary">
          от
        </p>
        <p className="text-xl font-900 italic leading-none tracking-tighter text-textPrimary">
          {formatMoney(pkg.final_price, pkg.currency)}
        </p>
      </div>

      <Link
        to={`/services/${pkg.id}`}
        className="mt-5 inline-flex items-center justify-center rounded-sct bg-textPrimary px-4 py-3 text-[11px] font-900 uppercase tracking-widest text-white transition-all group-hover:bg-brandBlue"
      >
        Выбрать услугу
      </Link>
    </article>
  )
}

function CategoryIcon({ code }: { code: string }) {
  // Минимальный mapping. Когда у нас будут реальные иконки от дизайнера —
  // заменим на нужные SVG.
  const c = code.toLowerCase()
  if (c.includes('engine_oil') || c.includes('oil')) return <IconOil />
  if (c.includes('brake')) return <IconBrake />
  if (c.includes('tire') || c.includes('wheel')) return <IconWheel />
  if (c.includes('diag')) return <IconDiag />
  if (c.includes('transmission')) return <IconGear />
  return <IconGear />
}

function IconOil() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 2v6m0 0a4 4 0 014 4v6a4 4 0 01-4 4 4 4 0 01-4-4v-6a4 4 0 014-4z"
      />
    </svg>
  )
}
function IconBrake() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
      <circle cx="12" cy="12" r="4" strokeWidth={2} />
    </svg>
  )
}
function IconWheel() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" strokeWidth={2} />
      <path d="M12 4v16M4 12h16M6 6l12 12M18 6L6 18" strokeWidth={1.5} />
    </svg>
  )
}
function IconDiag() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4m-6 0h6"
      />
    </svg>
  )
}
function IconGear() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
    </svg>
  )
}
