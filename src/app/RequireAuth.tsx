/**
 * Guard для защищённых роутов. Если юзер не залогинен — редирект на главную
 * с query-параметром `?modal=login`, чтобы лендинг сразу показал модалку входа
 * (модалка слушает search params). После успешного входа можно вернуть юзера
 * по `?next=/garage` — этим занимается LoginForm (см. features/auth).
 */
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { Spinner } from '@/shared/ui/Spinner'

export function RequireAuth({ children }: { children: ReactNode }) {
  const phase = useAuthStore((s) => s.phase)
  const location = useLocation()

  // Ждём первый hydrate, иначе мигнёт редирект.
  if (phase === 'idle' || phase === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (phase === 'guest') {
    const nextPath = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/?modal=login&next=${nextPath}`} replace />
  }

  return <>{children}</>
}
