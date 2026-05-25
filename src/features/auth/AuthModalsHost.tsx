/**
 * Глобальный хост модалок авторизации.
 *
 * Кнопка «Войти» в шапке (`Header.tsx`) добавляет `?modal=login` к
 * URL — а вот рендерить модалку нужно где-то «над всеми страницами».
 * Раньше это делалось только в HomePage, поэтому модалка работала
 * исключительно на главной. Теперь хост сидит в `Layout`, и модалки
 * открываются поверх любой страницы.
 *
 * Защита: если пользователь уже залогинен (`phase === 'authed'`) и
 * URL зачем-то остался с `?modal=login` (например, открыли старую
 * deep-link'у) — тихо стираем query, чтобы не рисовать пустую модалку
 * поверх ЛК.
 */
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoginModal } from './LoginModal'
import { RegisterModal } from './RegisterModal'
import { useAuthStore } from './store'

export function AuthModalsHost() {
  const [searchParams, setSearchParams] = useSearchParams()
  const modal = searchParams.get('modal')
  const phase = useAuthStore((s) => s.phase)

  useEffect(() => {
    // Если стало authed, а ?modal=login/register ещё висит — убираем.
    if (phase === 'authed' && (modal === 'login' || modal === 'register')) {
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

  const openModal = (name: 'login' | 'register') => {
    const next = new URLSearchParams(searchParams)
    next.set('modal', name)
    setSearchParams(next)
  }

  // Пока auth-store не инициализирован — модалки не рендерим (чтобы не
  // мигнуть «Войти» гостю, для которого через мгновение прилетит профиль
  // из hydrate).
  if (phase === 'idle' || phase === 'loading') return null
  if (phase === 'authed') return null

  return (
    <>
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
