/**
 * Карточка-сводка автомобиля на экране «Редактирование авто».
 *
 * Правка заказчика от 05.09: «перенести вот этот модуль с главной страницы —
 * без кнопки «Записаться на сервис» — чтобы просто вся информация была:
 * большая фотография, BMW X7 I (G07) Рестайлинг Внедорожник…, номер, год,
 * пробег, замена масла, ближайший. Потому что сейчас в редактировать авто
 * информации практически никакой нет, кроме поля и удаления, а места много».
 *
 * Поэтому повторяем геометрию features/home/ActiveCarBlock, но без CTA и без
 * плашки-рекомендации: экран про редактирование, а не про запись.
 */
import type { ClientGarageCar } from '@/shared/api/types'
import { Card } from '@/shared/ui/Card'
import { SafeImage } from '@/shared/ui/SafeImage'
import { CarSpecChips } from '@/features/service-book/CarSpecChips'
import { PlateBadge } from '@/features/service-book/CarHeroCompact'
import { useCarPhoto } from '@/features/service-book/carPhoto'
import { getCarPhoto, getCarSubtitle, getCarTitle } from './lib'
import { useCarYear } from './carYear'

export function CarSummaryCard({ car }: { car: ClientGarageCar }) {
  // Фото и год — из тех же источников, что и на остальных экранах, чтобы
  // машина везде выглядела и называлась одинаково.
  const photo = useCarPhoto(car.id) ?? getCarPhoto(car)
  const year = useCarYear(car.id)
  const title = getCarTitle(car)
  const subtitle = getCarSubtitle(car)

  return (
    <Card className="p-5 md:p-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sct border border-borderLight bg-surfaceLight">
            <SafeImage
              src={photo ?? undefined}
              alt={title}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-4xl font-900 uppercase text-borderLight">
                  {title.slice(0, 2)}
                </div>
              }
            />
            {car.is_default && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-brandBlue px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-white shadow">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brandYellow" />
                Активное авто
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-7">
          <h2 className="text-2xl font-900 uppercase leading-tight tracking-tight text-textPrimary md:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[12px] font-bold uppercase tracking-tight text-textSecondary">
              {subtitle}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <PlateBadge>{car.license_plate || '—'}</PlateBadge>
            {year && <PlateBadge>{String(year)}</PlateBadge>}
          </div>

          {car.vin_code && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-textSecondary">
              VIN: {car.vin_code}
            </p>
          )}

          {/* Пробег / Замена масла / Ближайший визит — тот же компонент, что на
              «Главной» и «Авто», только по этой машине, а не по активной. */}
          <div className="mt-5">
            <CarSpecChips carId={car.id} />
          </div>
        </div>
      </div>
    </Card>
  )
}
