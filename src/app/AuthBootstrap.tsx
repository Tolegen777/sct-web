/**
 * Один раз при старте приложения пробует подтянуть профиль клиента
 * по сохранённому в localStorage access-токену.
 *
 * До завершения hydrate всё, что под RequireAuth, показывает спиннер —
 * чтобы не мигало «гость» → «авторизован».
 */
import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store'
import { useStaffAuthStore } from '@/features/staff-auth/store'

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const clientPhase = useAuthStore((s) => s.phase)
  const hydrateClient = useAuthStore((s) => s.hydrate)
  const staffPhase = useStaffAuthStore((s) => s.phase)
  const hydrateStaff = useStaffAuthStore((s) => s.hydrate)

  useEffect(() => {
    if (clientPhase === 'idle') void hydrateClient()
  }, [clientPhase, hydrateClient])

  useEffect(() => {
    if (staffPhase === 'idle') void hydrateStaff()
  }, [staffPhase, hydrateStaff])

  return <>{children}</>
}
