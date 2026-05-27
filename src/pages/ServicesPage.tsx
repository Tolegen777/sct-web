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
import { GuestPrompt } from '@/features/auth/GuestPrompt'
import { useAuthStore } from '@/features/auth/store'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export default function ServicesPage() {
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  const { data, isLoading, isError, refetch } = usePackagesQuery()

  // Гостю показываем приглашение залогиниться вместо ошибки — query
  // запрос для него не делается (см. usePackagesQuery: enabled: isAuthed).
  if (!isAuthed) {
    return (
      <GuestPrompt
        title="Услуги доступны после регистрации"
        description="Пакеты обслуживания подбираются под конкретную модификацию вашего авто. Зарегистрируйтесь — за пару минут добавите машину и увидите подходящие пакеты с актуальными ценами."
      />
    )
  }

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
      <section className="container-sct space-y-8 py-6 md:py-8">
        <Skeleton.Box className="h-20 w-full" />
        <div>
          <Skeleton.Box className="mb-4 h-6 w-32" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton.Card key={i} className="h-72" />
            ))}
          </div>
        </div>
      </section>
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
