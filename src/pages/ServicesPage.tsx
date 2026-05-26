/**
 * Список услуг для активного автомобиля клиента.
 *
 * Layout по дизайну:
 *   - Узкая плашка активного авто сверху (ActiveCarStrip)
 *   - Секция «Акции» (PromoCard, 4 в ряд) — берётся из promotional_packages
 *   - Секция «Спецпредложения» (PromoCard, 4 в ряд) — пока используем
 *     `is_featured` подмножество regular_packages (если есть)
 *   - Секция «Все услуги» (ServiceCard, 3 в ряд) — остальные regular
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usePackagesQuery } from '@/features/packages/queries'
import { ActiveCarStrip } from '@/features/packages/ActiveCarStrip'
import { PromoCard } from '@/features/packages/PromoCard'
import { ServiceCard } from '@/features/packages/ServiceCard'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export default function ServicesPage() {
  const { data, isLoading, isError, refetch } = usePackagesQuery()

  // Разделяем regular_packages на «Спецпредложения» (featured) и «Все услуги».
  // Если featured пуст — секцию «Спецпредложения» скрываем.
  const { specials, regulars } = useMemo(() => {
    const all = data?.regular_packages ?? []
    return {
      specials: all.filter((p) => p.is_featured),
      regulars: all.filter((p) => !p.is_featured),
    }
  }, [data])

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

  const allEmpty =
    data.promotional_packages.length === 0 && data.regular_packages.length === 0

  return (
    <section className="container-sct space-y-10 py-6 md:py-8">
      <ActiveCarStrip activeCar={data.active_car} />

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
        <ServiceSection title="Акции">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.promotional_packages.map((p) => (
              <PromoCard key={p.id} pkg={p} />
            ))}
          </div>
        </ServiceSection>
      )}

      {specials.length > 0 && (
        <ServiceSection title="Спецпредложения">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {specials.map((p) => (
              <PromoCard key={p.id} pkg={p} />
            ))}
          </div>
        </ServiceSection>
      )}

      {regulars.length > 0 && (
        <ServiceSection title="Все услуги">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regulars.map((p) => (
              <ServiceCard key={p.id} pkg={p} />
            ))}
          </div>
        </ServiceSection>
      )}
    </section>
  )
}

function ServiceSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
        {title}
      </h2>
      {children}
    </section>
  )
}
