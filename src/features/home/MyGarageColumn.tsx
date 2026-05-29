/**
 * Сайдбар «МОЙ ГАРАЖ» (по дизайну new_screens).
 *
 * Используется на главной (authed) и в сервисной книжке. Сворачиваемый
 * (chevron в заголовке). Показывает НЕактивные авто (активное представлено
 * в hero/ActiveCarBlock) с кнопкой «Сделать активным», и плашку-CTA
 * «Добавить автомобиль».
 *
 * Если у клиента только активное авто — показываем только плашку-CTA.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarsQuery, useSetDefaultCarMutation } from '@/features/garage/queries'
import { Card } from '@/shared/ui/Card'
import { SafeImage } from '@/shared/ui/SafeImage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { cn } from '@/shared/lib/cn'
import { getCarPhoto, getCarTitle } from '@/features/garage/lib'
import type { ClientGarageCar } from '@/shared/api/types'

export function MyGarageColumn() {
  const { data: cars, isLoading } = useCarsQuery()
  const setDefault = useSetDefaultCarMutation()
  const [open, setOpen] = useState(true)

  // В сайдбаре — только неактивные авто (активное показано в hero).
  const others = (cars ?? []).filter((c) => !c.is_default)

  return (
    <Card className="p-5 md:p-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
        aria-expanded={open}
      >
        <h3 className="text-[12px] font-900 uppercase tracking-widest text-textSecondary">
          Мой гараж
        </h3>
        <svg
          className={cn(
            'h-4 w-4 text-textSecondary transition-transform',
            open ? '' : '-rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div className="mt-5 space-y-3">
          {isLoading ? (
            <>
              <Skeleton.Row />
              <Skeleton.Row />
            </>
          ) : (
            <>
              {others.map((car) => (
                <CarRow
                  key={car.id}
                  car={car}
                  onSetDefault={() => setDefault.mutate(car.id)}
                  isPending={setDefault.isPending && setDefault.variables === car.id}
                />
              ))}

              <Link
                to="/garage/add"
                className="flex flex-col items-center justify-center gap-2 rounded-sct border-2 border-dashed border-borderLight bg-surfaceLight/40 py-6 text-center transition-all hover:border-brandBlue hover:bg-blue-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brandBlue shadow-sm">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m7-7H5" />
                  </svg>
                </div>
                <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                  Добавить автомобиль
                </p>
              </Link>
            </>
          )}
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
  car: ClientGarageCar
  onSetDefault: () => void
  isPending: boolean
}) {
  const title = getCarTitle(car)
  const photo = getCarPhoto(car)
  return (
    <div className="rounded-sct border border-borderLight bg-white p-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-borderLight bg-surfaceLight">
          <SafeImage
            src={photo ?? undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-[10px] font-900 uppercase text-borderLight">
                {title.slice(0, 2)}
              </div>
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-900 uppercase tracking-tight text-textPrimary">
            {title}
          </p>
          {car.license_plate && (
            <span className="mt-1 inline-block rounded bg-surfaceMuted px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-textSecondary">
              {car.license_plate}
            </span>
          )}
        </div>
      </div>

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
    </div>
  )
}
