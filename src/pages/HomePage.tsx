/**
 * Главная страница.
 *
 * Для гостя:  Hero → промо-баннер → преимущества SCT.
 * Для клиента: Hero → AuthedDashboard (активное авто, рекомендация, визиты) → промо.
 *
 * Модалки login/register живут в Layout (`AuthModalsHost`) — открываются
 * через `?modal=login|register` с любой страницы. Здесь их рендерить
 * не нужно.
 */
import { useAuthStore } from '@/features/auth/store'
import { HomeHero } from '@/features/home/Hero'
import { PromoBanner } from '@/features/home/PromoBanner'
import { Benefits } from '@/features/home/Benefits'
import { AuthedDashboard } from '@/features/home/AuthedDashboard'

export default function HomePage() {
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  return (
    <section className="container-sct space-y-10 py-8 md:space-y-12 md:py-12">
      <HomeHero />

      {isAuthed ? (
        <>
          <AuthedDashboard />
          <PromoBanner />
        </>
      ) : (
        <>
          <PromoBanner />
          <Benefits />
        </>
      )}
    </section>
  )
}
