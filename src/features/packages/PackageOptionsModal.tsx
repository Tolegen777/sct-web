/**
 * Модалка «Доступные предложения» (по дизайну new_screens).
 *
 * Открывается по «Выбрать услугу» на /services и показывает карусель
 * пакетов выбранной категории: состав, цена, «Выбрать пакет» → детальная.
 */
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from './lib'
import type { ClientServicePackage } from '@/shared/api/types'

interface PackageOptionsModalProps {
  open: boolean
  onClose: () => void
  categoryName: string
  packages: ClientServicePackage[]
}

export function PackageOptionsModal({
  open,
  onClose,
  categoryName,
  packages,
}: PackageOptionsModalProps) {
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })

  const choose = (id: number) => {
    onClose()
    navigate(`/services/${id}`)
  }

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
        Доступные предложения
      </p>
      <div className="flex items-center justify-between gap-3 pr-8">
        <h2 className="text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
          {categoryName}
        </h2>
        {packages.length > 1 && (
          <div className="hidden gap-2 sm:flex">
            <ArrowButton dir="left" onClick={() => scrollBy(-1)} />
            <ArrowButton dir="right" onClick={() => scrollBy(1)} />
          </div>
        )}
      </div>

      <div ref={ref} className="no-scrollbar mt-5 flex snap-x gap-4 overflow-x-auto pb-2">
        {packages.map((pkg) => (
          <OptionCard key={pkg.id} pkg={pkg} onSelect={() => choose(pkg.id)} />
        ))}
      </div>
    </Modal>
  )
}

function OptionCard({ pkg, onSelect }: { pkg: ClientServicePackage; onSelect: () => void }) {
  const title = getPackageShortTitle(pkg)
  const bullets = (pkg.package_items ?? []).slice(0, 4)
  return (
    <div className="flex w-[260px] shrink-0 snap-start flex-col rounded-sct border border-borderLight bg-white p-5 md:w-[280px]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-900 uppercase leading-tight tracking-tight text-textPrimary">
            {title}
          </h3>
          {pkg.short_description && (
            <p className="mt-1 text-[11px] font-bold uppercase tracking-tight text-brandBlue">
              {pkg.short_description}
            </p>
          )}
        </div>
        {pkg.has_promotion && pkg.discount_type === 'PERCENT' && (
          <span className="shrink-0 rounded-md bg-brandYellow px-2 py-1 text-[10px] font-900 uppercase tracking-widest text-textPrimary">
            −{Number(pkg.discount_percent)}%
          </span>
        )}
      </div>

      {bullets.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {bullets.map((it) => (
            <li key={it.id} className="flex items-start gap-2 text-[12px] font-medium text-textSecondary">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brandBlue" />
              <span className="truncate">{it.item_name}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4">
        <p className="text-[9px] font-900 uppercase tracking-widest text-textSecondary">Цена от</p>
        <p className="mt-0.5 text-xl font-900 tracking-tighter text-textPrimary">
          {formatMoney(pkg.final_price, pkg.currency)}
        </p>
        <button
          type="button"
          onClick={onSelect}
          className="mt-4 w-full rounded-sct bg-brandBlue py-3 text-[11px] font-900 uppercase tracking-widest text-white transition-all hover:bg-brandBlueDark"
        >
          Выбрать пакет
        </button>
      </div>
    </div>
  )
}

function ArrowButton({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 'left' ? 'Назад' : 'Вперёд'}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-borderLight bg-white text-textSecondary transition-colors hover:border-brandBlue hover:text-brandBlue"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  )
}
