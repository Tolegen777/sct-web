/**
 * Базовый layout: header + main + footer.
 * Все страницы рендерятся внутрь Outlet.
 *
 * Header'ы два: desktop (нав-меню по центру, аватар справа) и мобильный
 * (только логотип). Внизу на мобилке будет таб-бар для залогиненных
 * (Сервисная книжка / Гараж / Услуги / Контакты) — сделаю позже,
 * когда дойдём до Сервисной книжки.
 */
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { Spinner } from '@/shared/ui/Spinner'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[50vh] items-center justify-center">
              <Spinner />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
