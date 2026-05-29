/**
 * Главная страница — два режима.
 *
 * Гость (маркетинговый лендинг):
 *   1. Hero (бейдж + заголовок + 2 CTA + фото)
 *   2. Преимущества (3 карточки)
 *   3. Наши основные услуги (4 карточки)
 *   4. Промо «для новых клиентов»
 *
 * Авторизованный (дашборд, по дизайну new_screens):
 *   1. Двухколоночный верх: Hero (слева) + «Мой гараж» (справа)
 *   2. Активное авто
 *   3. Промо-баннер «−20%» с обратным отсчётом
 *   4. Предстоящие визиты (если есть активные записи)
 *   5. История обслуживания (если есть завершённые)
 *
 * Приватные секции требуют авторизации, их query-хуки сами не запускаются
 * (см. enabled: isAuthed). Секции «Спецпредложения» и «Популярные услуги»
 * убраны с главной по финальному макету (компоненты сохранены в features/home).
 */
import { useAuthStore } from '@/features/auth/store'
import { useCarsQuery } from '@/features/garage/queries'
import { HomeHero } from '@/features/home/HomeHero'
import { HomePromoBanner } from '@/features/home/HomePromoBanner'
import { ActiveCarBlock } from '@/features/home/ActiveCarBlock'
import { MyGarageColumn } from '@/features/home/MyGarageColumn'
import { WhyUsSection } from '@/features/home/WhyUsSection'
import { MainServicesSection } from '@/features/home/MainServicesSection'
import { UpcomingVisitsSection } from '@/features/home/UpcomingVisitsSection'
import { HistoryTable } from '@/features/home/HistoryTable'

export default function HomePage() {
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  const carsQuery = useCarsQuery()
  const hasCars = isAuthed && (carsQuery.data?.length ?? 0) > 0

  // Гость — маркетинговый лендинг.
  if (!isAuthed) {
    return (
      <section className="container-sct space-y-6 py-6 md:space-y-10 md:py-8">
        <HomeHero hasCars={false} />
        <WhyUsSection />
        <MainServicesSection />
        <HomePromoBanner />
      </section>
    )
  }

  // Авторизованный — дашборд.
  return (
    <section className="container-sct space-y-6 py-6 md:space-y-10 md:py-8">
      {/* Верх: Hero (слева) + Мой гараж (справа) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <HomeHero hasCars={hasCars} />
        </div>
        <div className="lg:col-span-4">
          <MyGarageColumn />
        </div>
      </div>

      <ActiveCarBlock />

      <HomePromoBanner />

      {hasCars && (
        <>
          <UpcomingVisitsSection />
          <HistoryTable />
        </>
      )}
    </section>
  )
}
