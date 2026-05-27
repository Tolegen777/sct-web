/**
 * Sticky-меню снизу для мобильных устройств.
 *
 * Видимо только на `<md` (под десктопом скрыто). 4 пункта:
 *   Главная / Услуги / Сервисная книжка / Контакты
 *
 * Сервисная книжка показывается только авторизованным — для гостя
 * там 403. Подставляем 4-й пункт (Контакты) на её место, чтобы
 * сетка осталась 4-колоночной.
 *
 * Стилистика: тёмно-navy фон под цвет хедера, активный пункт — белый,
 * остальные — приглушённо-белые. SVG-иконки inline.
 */
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/shared/lib/cn'

type Tab = {
  to: string
  label: string
  icon: 'home' | 'service' | 'book' | 'phone' | 'garage'
  end?: boolean
  authOnly?: boolean
}

const TABS: Tab[] = [
  { to: '/', label: 'Главная', icon: 'home', end: true },
  { to: '/services', label: 'Услуги', icon: 'service' },
  { to: '/service-book', label: 'Книжка', icon: 'book', authOnly: true },
  { to: '/garage', label: 'Гараж', icon: 'garage', authOnly: true },
  { to: '/contacts', label: 'Контакты', icon: 'phone' },
]

export function MobileTabBar() {
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  // Для гостя authOnly-пункты убираем. Берём первые 4.
  const tabs = TABS.filter((t) => !t.authOnly || isAuthed).slice(0, 4)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-navy md:hidden"
      aria-label="Основная навигация"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 transition-colors',
                  isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <TabIcon name={tab.icon} active={isActive} />
                  <span className="text-[10px] font-900 uppercase tracking-widest">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function TabIcon({ name, active }: { name: Tab['icon']; active: boolean }) {
  const stroke = active ? 2.5 : 2
  switch (name) {
    case 'home':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'service':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'book':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'garage':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    case 'phone':
      return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
  }
}
