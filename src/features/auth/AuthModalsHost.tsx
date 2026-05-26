/**
 * Глобальный хост модалок авторизации.
 *
 * Управляет тремя модалками через query-параметр:
 *   ?modal=login          → LoginModal
 *   ?modal=register       → RegisterModal
 *   ?modal=forgot-password → ForgotPasswordModal (3 шага)
 *
 * Если пользователь уже залогинен и в URL почему-то остался ?modal=...
 * — query тихо стирается, чтобы не рендерить пустую модалку над ЛК.
 */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { useAuthStore } from './store'

type ModalName = 'login' | 'register' | 'forgot-password'
const ALLOWED_MODALS: ModalName[] = ['login', 'register', 'forgot-password']

export function AuthModalsHost() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modal = searchParams.get('modal') as ModalName | null
  const phase = useAuthStore((s) => s.phase)

  useEffect(() => {
    if (
      phase === 'authed' &&
      modal &&
      ALLOWED_MODALS.includes(modal)
    ) {
      const next = new URLSearchParams(searchParams)
      next.delete('modal')
      setSearchParams(next, { replace: true })
    }
  }, [phase, modal, searchParams, setSearchParams])

  const closeModal = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('modal')
    setSearchParams(next, { replace: true })
  }

  const openModal = (name: ModalName) => {
    const next = new URLSearchParams(searchParams)
    next.set('modal', name)
    setSearchParams(next)
  }

  if (phase === 'idle' || phase === 'loading') return null
  if (phase === 'authed') return null

  return (
    <>
      <LoginModal
        open={modal === 'login'}
        onClose={closeModal}
        onSwitchToRegister={() => openModal('register')}
        onForgotPassword={() => openModal('forgot-password')}
      />
      <RegisterModal
        open={modal === 'register'}
        onClose={closeModal}
        onSwitchToLogin={() => openModal('login')}
      />
      <ForgotPasswordModal
        open={modal === 'forgot-password'}
        onClose={closeModal}
        onBackToLogin={() => openModal('login')}
      />
    </>
  )
}
