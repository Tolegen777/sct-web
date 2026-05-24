/**
 * Карточка одного авто в гараже клиента.
 *
 * Состояния:
 *  - is_default = true:  бейдж «Активен», кнопка «Сделать активным» не показывается
 *  - is_default = false: показываем кнопку «Сделать активным»
 *
 * Все мутации (set-default / delete) выполняются на уровне родителя — мы только
 * вызываем коллбэки. Так компонент остаётся переиспользуемым.
 */
import { Link } from 'react-router-dom'
import type { ClientGarageCar } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import { formatMileage } from '@/shared/lib/format'
import { getCarPhoto, getCarSubtitle, getCarTitle } from './lib'

interface CarCardProps {
  car: ClientGarageCar
  onSetDefault: (id: number) => void
  onDelete: (car: ClientGarageCar) => void
  isSettingDefault?: boolean
}

export function CarCard({ car, onSetDefault, onDelete, isSettingDefault }: CarCardProps) {
  const photo = getCarPhoto(car)
  const title = getCarTitle(car)
  const subtitle = getCarSubtitle(car)

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-sct-lg border bg-white p-5 transition-all',
        car.is_default
          ? 'border-brandBlue bg-blue-50/30 shadow-soft-blue'
          : 'border-borderLight hover:border-brandBlue hover:shadow-soft-card',
      )}
    >
      {car.is_default && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg bg-brandBlue px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-white shadow-lg">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brandYellow" />
          Активен
        </span>
      )}

      <div className="flex items-center gap-5">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-borderLight bg-surfaceLight md:h-24 md:w-24">
          <SafeImage
            src={photo ?? undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-borderLight">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-900 uppercase italic tracking-tight text-textPrimary md:text-xl">
            {car.nickname || title}
          </h3>
          {subtitle && (
            <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-tight text-textSecondary">
              {subtitle}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {car.license_plate && (
              <span className="inline-block rounded bg-textPrimary px-2 py-0.5 font-mono text-[10px] font-800 uppercase text-white">
                {car.license_plate}
              </span>
            )}
            {typeof car.latest_mileage_km === 'number' && car.latest_mileage_km > 0 && (
              <span className="text-[11px] font-bold uppercase tracking-widest text-textSecondary">
                {formatMileage(car.latest_mileage_km)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-borderLight/50 pt-4">
        {!car.is_default && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onSetDefault(car.id)}
            loading={isSettingDefault}
          >
            Сделать активным
          </Button>
        )}
        <Link to={`/garage/edit/${car.id}`} className={cn(car.is_default && 'flex-1')}>
          <Button variant="secondary" size="sm" fullWidth>
            Редактировать
          </Button>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(car)}
          aria-label="Удалить автомобиль"
          className="inline-flex h-9 w-9 items-center justify-center rounded-sct border border-borderLight text-textSecondary transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </article>
  )
}
