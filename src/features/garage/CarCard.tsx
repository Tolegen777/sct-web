/**
 * Карточка одного авто в гараже клиента (по дизайну new_screens).
 *
 * Состояния:
 *  - is_default = true:  жёлтый бейдж «Активен», подсветка карточки,
 *    одна кнопка «Редактировать» на всю ширину;
 *  - is_default = false: кнопки «Сделать активным» (blue) + «Редактировать».
 *
 * Удаление авто вынесено на страницу редактирования (по дизайну на карточке
 * его нет). set-default выполняется на уровне родителя через коллбэк.
 */
import { Link } from 'react-router-dom'
import type { ClientGarageCar } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { cn } from '@/shared/lib/cn'
import { getCarPhoto, getCarSubtitle, getCarTitle } from './lib'

interface CarCardProps {
  car: ClientGarageCar
  onSetDefault: (id: number) => void
  isSettingDefault?: boolean
}

const editIcon = (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
)

export function CarCard({ car, onSetDefault, isSettingDefault }: CarCardProps) {
  const photo = getCarPhoto(car)
  const title = getCarTitle(car)
  const subtitle = getCarSubtitle(car)
  const isActive = Boolean(car.is_default)

  return (
    <article
      className={cn(
        'flex flex-col rounded-sct-lg border bg-white p-5 transition-all',
        isActive
          ? 'border-brandBlue bg-blue-50/30 shadow-soft-blue'
          : 'border-borderLight hover:border-brandBlue/50 hover:shadow-soft-card',
      )}
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-borderLight bg-surfaceLight">
          <SafeImage
            src={photo ?? undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-borderLight">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11m-14 0h14m-14 0a2 2 0 00-2 2v3a1 1 0 001 1h1m14-6a2 2 0 012 2v3a1 1 0 01-1 1h-1M7 17a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zm10 0a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0z" />
                </svg>
              </div>
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-lg font-900 uppercase tracking-tight text-textPrimary md:text-xl">
              {car.nickname || title}
            </h3>
            {isActive && (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brandYellow px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-textPrimary">
                <span className="h-1.5 w-1.5 rounded-full bg-textPrimary/70" />
                Активен
              </span>
            )}
          </div>
          {subtitle && (
            <p
              className={cn(
                'mt-1 truncate text-[12px] font-bold uppercase tracking-tight',
                isActive ? 'text-brandBlue' : 'text-textSecondary',
              )}
            >
              {subtitle}
            </p>
          )}
          {car.license_plate && (
            <span className="mt-2 inline-block rounded bg-textPrimary px-2 py-0.5 font-mono text-[10px] font-800 uppercase text-white">
              {car.license_plate}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-borderLight/60 pt-4">
        {!isActive && (
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
        <Link to={`/garage/edit/${car.id}`} className={isActive ? 'flex-1' : ''}>
          <Button variant="secondary" size="sm" fullWidth leftIcon={editIcon}>
            Редактировать
          </Button>
        </Link>
      </div>
    </article>
  )
}
