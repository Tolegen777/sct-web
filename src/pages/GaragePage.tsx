/**
 * Страница «Гараж» — список авто клиента.
 *
 * Логика:
 *  - грузим GET /garage/cars/
 *  - пустой массив → EmptyGarage (с CTA «Добавить»)
 *  - иначе — грид карточек + плитка «+ Добавить» в конце
 *  - set-default / delete управляем здесь, потому что они общие на всю страницу
 *
 * Сортировка: активное (is_default=true) всегда первым, остальные — в порядке
 * прихода с бэка.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCarsQuery, useDeleteCarMutation, useSetDefaultCarMutation } from '@/features/garage/queries'
import { CarCard } from '@/features/garage/CarCard'
import { DeleteCarDialog } from '@/features/garage/DeleteCarDialog'
import { EmptyGarage } from '@/features/garage/EmptyGarage'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Button } from '@/shared/ui/Button'
import type { ClientGarageCar } from '@/shared/api/types'
import { parseApiError } from '@/features/auth/errors'

export default function GaragePage() {
  const { data: cars, isLoading, isError, error, refetch } = useCarsQuery()
  const setDefault = useSetDefaultCarMutation()
  const remove = useDeleteCarMutation()
  const [confirmDelete, setConfirmDelete] = useState<ClientGarageCar | null>(null)

  if (isLoading) {
    return (
      <section className="container-sct py-6 md:py-8">
        <Skeleton.Box className="mb-6 h-10 w-1/2" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton.Card key={i} className="h-48" />
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    const message = parseApiError(error, 'Не удалось загрузить гараж.').general
    return (
      <section className="container-sct py-12">
        <div className="rounded-sct border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-bold">{message}</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="mt-4">
            Повторить
          </Button>
        </div>
      </section>
    )
  }

  const list = cars ?? []

  // Active car сначала — это естественный порядок для UI.
  const sortedCars = [...list].sort((a, b) => Number(b.is_default) - Number(a.is_default))

  if (sortedCars.length === 0) {
    return (
      <section className="container-sct py-10 md:py-16">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:text-5xl">
            Мой гараж
          </h1>
          <p className="mt-2 text-sm font-medium italic text-textSecondary md:mt-4 md:text-base">
            Управляйте автопарком и выбирайте активный автомобиль.
          </p>
        </header>
        <EmptyGarage />
      </section>
    )
  }

  return (
    <section className="container-sct py-10 md:py-16">
      <header className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:text-5xl">
            Мой гараж
          </h1>
          <p className="mt-2 text-sm font-medium italic text-textSecondary md:mt-3 md:text-base">
            {sortedCars.length === 1
              ? '1 автомобиль'
              : `${sortedCars.length} автомобилей`}
          </p>
        </div>
        <Link to="/garage/add">
          <Button variant="dark" size="md">
            + Добавить авто
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sortedCars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onSetDefault={(id) => setDefault.mutate(id)}
            onDelete={(c) => setConfirmDelete(c)}
            isSettingDefault={setDefault.isPending && setDefault.variables === car.id}
          />
        ))}

        <Link
          to="/garage/add"
          className="flex flex-col items-center justify-center gap-3 rounded-sct-lg border-2 border-dashed border-borderLight bg-surfaceLight/40 p-10 text-center transition-all hover:border-brandBlue hover:bg-white"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-textSecondary shadow-sct-soft">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-[11px] font-900 uppercase tracking-[0.2em] text-textSecondary">
            Добавить авто
          </p>
        </Link>
      </div>

      <DeleteCarDialog
        car={confirmDelete}
        onCancel={() => setConfirmDelete(null)}
        loading={remove.isPending}
        onConfirm={() => {
          if (!confirmDelete) return
          remove.mutate(confirmDelete.id, {
            onSuccess: () => setConfirmDelete(null),
          })
        }}
      />
    </section>
  )
}
