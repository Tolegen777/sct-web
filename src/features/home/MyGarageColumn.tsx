/**
 * Правая колонка «МОЙ ГАРАЖ» на главной (и других dashboard-страницах).
 *
 * Содержит:
 *   - Список авто клиента (компактные карточки с фото, названием и
 *     госномером).
 *   - Кнопка «Сделать активным» под каждой неактивной машиной.
 *   - Кнопка «Изменить активную машину» — переход к её редактированию.
 *   - Плашка-CTA «+ Добавить автомобиль» внизу.
 *
 * Если у клиента нет авто — показываем только плашку-CTA.
 * Для гостя компонент не рендерим (управляет родитель).
 */
import { Link } from 'react-router-dom'
import { useCarsQuery, useSetDefaultCarMutation } from '@/features/garage/queries'
import { Card } from '@/shared/ui/Card'
import { SafeImage } from '@/shared/ui/SafeImage'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import { getCarPhoto, getCarTitle } from '@/features/garage/lib'

export function MyGarageColumn() {
  const { data: cars, isLoading } = useCarsQuery()
  const setDefault = useSetDefaultCarMutation()

  return (
    <Card className="p-5 md:p-6">
      <header className="mb-5 flex items-center justify-between">
        <h3 className="text-[12px] font-900 uppercase tracking-widest text-textSecondary">
          Мой гараж
        </h3>
        {cars && cars.length > 0 && (
          <Link
            to="/garage"
            className="text-[10px] font-bold uppercase tracking-widest text-brandBlue hover:underline"
          >
            Все →
          </Link>
        )}
      </header>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-3">
          {(cars ?? []).map((car) => (
            <CarRow
              key={car.id}
              car={car}
              onSetDefault={() => setDefault.mutate(car.id)}
              isPending={setDefault.isPending && setDefault.variables === car.id}
            />
          ))}

          <Link
            to="/garage/add"
            className="flex h-[100px] items-center justify-center rounded-sct border-2 border-dashed border-borderLight bg-surfaceLight/40 text-center transition-all hover:border-brandBlue hover:bg-blue-50"
          >
            <div>
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brandBlue shadow-sm">
                +
              </div>
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Добавить автомобиль
              </p>
            </div>
          </Link>
        </div>
      )}
    </Card>
  )
}

function CarRow({
  car,
  onSetDefault,
  isPending,
}: {
  car: import('@/shared/api/types').ClientGarageCar
  onSetDefault: () => void
  isPending: boolean
}) {
  const isActive = Boolean(car.is_default)
  const title = getCarTitle(car)
  const photo = getCarPhoto(car)
  return (
    <div
      className={cn(
        'rounded-sct border bg-white p-3 transition-all',
        isActive
          ? 'border-brandBlue shadow-soft-blue'
          : 'border-borderLight hover:border-brandBlue/50',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-borderLight bg-surfaceLight">
          <SafeImage
            src={photo ?? undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-[10px] font-900 uppercase italic text-borderLight">
                {title.slice(0, 2)}
              </div>
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-900 uppercase italic tracking-tight text-textPrimary">
            {title}
          </p>
          {car.license_plate && (
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-textSecondary">
              {car.license_plate}
            </p>
          )}
        </div>
      </div>

      {!isActive && (
        <button
          type="button"
          onClick={onSetDefault}
          disabled={isPending}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-brandBlue px-3 py-2 text-[10px] font-900 uppercase tracking-widest text-white shadow-soft-blue transition-all hover:bg-brandBlueDark disabled:opacity-60"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          {isPending ? 'Сохраняем…' : 'Сделать активным'}
        </button>
      )}
    </div>
  )
}
