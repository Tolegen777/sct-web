/**
 * Один раз при старте приложения пробует подтянуть профиль клиента
 * по сохранённому в localStorage access-токену.
 *
 * До завершения hydrate всё, что под RequireAuth, показывает спиннер —
 * чтобы не мигало «гость» → «авторизован».
 */
import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store'

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const clientPhase = useAuthStore((s) => s.phase)
  const hydrateClient = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    if (clientPhase === 'idle') void hydrateClient()
  }, [clientPhase, hydrateClient])

  return <>{children}</>
}
