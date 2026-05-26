/**
 * Компактная hero-карточка активной машины (горизонтальная).
 *
 * Используется на главной (как часть dashboard) и на сервисной книжке.
 * Слева — квадратное фото машины с плашкой «активное авто», справа —
 * название (AUDI A4 2016 3.5 L), госномер плашкой, кнопка редактирования
 * (карандаш) в правом верхнем углу карточки.
 *
 * Отличается от CarHero тем, что не имеет правого блока со счётчиком
 * «+N других машин» — этот функционал перенесён в правую колонку
 * MyGarageColumn.
 */
import { Link } from 'react-router-dom'
import type { ServiceBookCar } from './types'
import { Card } from '@/shared/ui/Card'
import { SafeImage } from '@/shared/ui/SafeImage'

interface CarHeroCompactProps {
  car: ServiceBookCar
}

export function CarHeroCompact({ car }: CarHeroCompactProps) {
  const title = `${car.mark.display_name} ${car.model.name}${car.generation ? ` ${car.generation.year_from}` : ''}`
  return (
    <Card className="relative p-5 md:p-6">
      <Link
        to={`/garage/edit/${car.id}`}
        className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-borderLight bg-white text-textSecondary transition-all hover:border-brandBlue hover:text-brandBlue"
        title="Редактировать авто"
        aria-label="Редактировать авто"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      </Link>

      <div className="flex items-center gap-5 md:gap-6">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-sct border border-borderLight bg-surfaceLight md:h-28 md:w-28">
          <SafeImage
            src={car.image_url ?? undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-2xl font-900 uppercase italic text-borderLight">
                {car.mark.name.slice(0, 2)}
              </div>
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-2 rounded-md bg-brandBlue px-2 py-0.5 text-[10px] font-900 uppercase tracking-widest text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brandYellow" />
            Активное авто
          </span>
          <h2 className="mt-3 text-2xl font-900 uppercase italic leading-none tracking-tight text-textPrimary md:text-3xl">
            {title.toUpperCase()}
          </h2>
          {car.license_plate && (
            <span className="mt-3 inline-block rounded-md bg-textPrimary px-3 py-1 font-mono text-[12px] font-900 uppercase tracking-widest text-white">
              {car.license_plate}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
