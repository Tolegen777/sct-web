/**
 * Базовый layout: header + main + footer.
 * Все страницы рендерятся внутрь Outlet.
 *
 * Header'ы два: desktop (нав-меню по центру, аватар справа) и мобильный
 * (только логотип). Внизу на мобилке будет таб-бар для залогиненных
 * (Сервисная книжка / Гараж / Услуги / Контакты) — сделаю позже,
 * когда дойдём до Сервисной книжки.
 */
import { Suspense, lazy } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileTabBar } from './MobileTabBar'
import { ErrorBoundary } from './ErrorBoundary'
import { Spinner } from '@/shared/ui/Spinner'
import { ToastViewport } from '@/shared/ui/Toast'
import { AuthModalsHost } from '@/features/auth/AuthModalsHost'
import { useAuthStore } from '@/features/auth/store'

const BlockedPage = lazy(() => import('@/pages/BlockedPage'))

export function Layout() {
  const location = useLocation()
  const profile = useAuthStore((s) => s.profile)
  const isBlocked = profile?.status === 'BLOCKED'

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        {/* Если клиент BLOCKED — показываем экран блокировки вместо
            обычного контента. Шапку и футер оставляем, чтобы можно было
            видеть кнопку «Выйти». */}
        {isBlocked ? (
          <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><Spinner /></div>}>
            <BlockedPage />
          </Suspense>
        ) : (
          /* ErrorBoundary вокруг Outlet — упавший компонент не убивает шапку
             и навигацию. Сбрасываем по смене pathname, чтобы переход на
             другой роут вернул нормальный рендер. */
          <ErrorBoundary resetKeys={[location.pathname]}>
            <Suspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <Spinner />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        )}
      </main>
      <Footer />
      {/* Модалки login/register живут глобально — открываются с любой страницы
          через ?modal=login|register. */}
      <AuthModalsHost />
      <ToastViewport />
      {/* Sticky-меню снизу — только мобильный размер */}
      <MobileTabBar />
    </div>
  )
}
