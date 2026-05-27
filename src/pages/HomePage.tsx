/**
 * Главная страница — единый дашборд для авторизованного клиента.
 *
 * Layout по обновлённому дизайну (одноколоночный, без правой колонки гаража):
 *   1. Hero — приветствие + 2 CTA
 *   2. Активное авто (только если есть машина)
 *   3. Промо-баннер «−20%»
 *   4. Спецпредложения по пакетам (4 карточки)
 *   5. Популярные услуги (6 карточек)
 *   6. Предстоящие визиты (если есть активные записи)
 *   7. История обслуживания (если есть завершённые)
 *
 * Гость видит: Hero + Промо. Остальные секции требуют авторизации
 * и их query-хуки сами не запускаются (см. enabled: isAuthed).
 */
import { useAuthStore } from '@/features/auth/store'
import { useCarsQuery } from '@/features/garage/queries'
import { HomeHero } from '@/features/home/HomeHero'
import { HomePromoBanner } from '@/features/home/HomePromoBanner'
import { ActiveCarBlock } from '@/features/home/ActiveCarBlock'
import { FeaturedPackagesSection } from '@/features/home/FeaturedPackagesSection'
import { PopularServicesSection } from '@/features/home/PopularServicesSection'
import { UpcomingVisitsSection } from '@/features/home/UpcomingVisitsSection'
import { HistoryTable } from '@/features/home/HistoryTable'

export default function HomePage() {
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  const carsQuery = useCarsQuery()
  const hasCars = isAuthed && (carsQuery.data?.length ?? 0) > 0

  return (
    <section className="container-sct space-y-6 py-6 md:space-y-10 md:py-8">
      <HomeHero hasCars={hasCars} />

      {isAuthed && <ActiveCarBlock />}

      <HomePromoBanner />

      {isAuthed && hasCars && (
        <>
          <FeaturedPackagesSection />
          <PopularServicesSection />
          <UpcomingVisitsSection />
          <HistoryTable />
        </>
      )}
    </section>
  )
}
