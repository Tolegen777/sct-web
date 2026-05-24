/**
 * Список услуг для активного автомобиля клиента.
 *
 * Бэк отдаёт два массива пакетов: `regular_packages` и `promotional_packages`.
 * Акционные показываем отдельной секцией сверху.
 * Внутри regular группируем по category — это даёт привычную «полку» по
 * темам (Замена масла, Тормоза, Диагностика…). Категорий нет — показываем
 * плоско.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePackagesQuery } from '@/features/packages/queries'
import { PackageCard } from '@/features/packages/PackageCard'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import type { ClientServicePackage } from '@/shared/api/types'

export default function ServicesPage() {
  const { data, isLoading, isError, refetch } = usePackagesQuery()

  const groupedRegular = useMemo(() => groupByCategory(data?.regular_packages ?? []), [data])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <section className="container-sct py-12">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Не удалось загрузить услуги.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
            Повторить
          </Button>
        </Card>
      </section>
    )
  }

  if (!data.active_car) {
    return (
      <section className="container-sct py-12">
        <Card className="border-2 border-dashed border-borderLight p-10 text-center md:p-16">
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            Сначала добавьте автомобиль
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium italic text-textSecondary">
            Пакеты услуг подбираются под конкретную модификацию вашего авто.
            Добавьте машину — и увидите доступные пакеты.
          </p>
          <Link to="/garage/add" className="mt-8 inline-block">
            <Button variant="dark" size="lg">
              Добавить автомобиль
            </Button>
          </Link>
        </Card>
      </section>
    )
  }

  const allEmpty = data.regular_packages.length === 0 && data.promotional_packages.length === 0

  return (
    <section className="container-sct py-8 md:py-12">
      <header className="mb-8">
        <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
          Услуги для вашего авто
        </p>
        <h1 className="mt-2 text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:text-5xl">
          {data.active_car.car_title}
        </h1>
        <div className="mt-3 inline-flex items-center gap-3 rounded-sct border border-borderLight bg-surfaceLight px-3 py-1.5">
          <span className="font-mono text-[11px] font-900 uppercase tracking-widest text-textPrimary">
            {data.active_car.license_plate}
          </span>
        </div>
      </header>

      {allEmpty && (
        <Card className="p-8 text-center">
          <p className="text-base font-bold text-textSecondary">
            Для этой модификации пока нет опубликованных пакетов.
          </p>
          <p className="mt-2 text-sm text-textSecondary/70">
            Зайдите позже или выберите другое авто в гараже.
          </p>
        </Card>
      )}

      {data.promotional_packages.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 inline-flex items-center gap-2 text-base font-900 uppercase italic tracking-tight text-textPrimary md:text-xl">
            <span className="rounded-md bg-brandOrange px-2 py-0.5 text-[10px] font-900 uppercase tracking-widest text-white">
              Акции
            </span>
            Специальные предложения
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data.promotional_packages.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </section>
      )}

      {groupedRegular.map(([category, items]) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-base font-900 uppercase italic tracking-tight text-textPrimary md:text-xl">
            {category}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => (
              <PackageCard key={p.id} pkg={p} />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

function groupByCategory(packages: ClientServicePackage[]): [string, ClientServicePackage[]][] {
  const groups = new Map<string, ClientServicePackage[]>()
  const order: string[] = []
  for (const pkg of packages) {
    const name = pkg.category?.name ?? 'Другие услуги'
    if (!groups.has(name)) {
      groups.set(name, [])
      order.push(name)
    }
    groups.get(name)!.push(pkg)
  }
  return order.map((name) => [name, groups.get(name)!])
}
