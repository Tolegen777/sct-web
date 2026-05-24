/**
 * Главная страница.
 *
 * Для гостя:  Hero → промо-баннер → преимущества SCT.
 * Для клиента: Hero → AuthedDashboard (активное авто, рекомендация, визиты) → промо.
 *
 * Модалки login/register/forgot управляются через query-параметр ?modal=...
 * (так оно deep-linkable + работает с RequireAuth-редиректом ?next=).
 */
import { useSearchParams } from 'react-router-dom'
import { LoginModal } from '@/features/auth/LoginModal'
import { RegisterModal } from '@/features/auth/RegisterModal'
import { useAuthStore } from '@/features/auth/store'
import { HomeHero } from '@/features/home/Hero'
import { PromoBanner } from '@/features/home/PromoBanner'
import { Benefits } from '@/features/home/Benefits'
import { AuthedDashboard } from '@/features/home/AuthedDashboard'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modal = searchParams.get('modal')
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  const closeModal = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('modal')
    setSearchParams(next, { replace: true })
  }

  const openModal = (name: 'login' | 'register') => {
    const next = new URLSearchParams(searchParams)
    next.set('modal', name)
    setSearchParams(next)
  }

  return (
    <>
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

      <LoginModal
        open={modal === 'login'}
        onClose={closeModal}
        onSwitchToRegister={() => openModal('register')}
      />
      <RegisterModal
        open={modal === 'register'}
        onClose={closeModal}
        onSwitchToLogin={() => openModal('login')}
      />
    </>
  )
}
