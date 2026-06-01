/**
 * Sticky-меню снизу для мобильных устройств.
 *
 * Видимо только на `<md` (под десктопом скрыто). Светлый (белый) бар,
 * активный пункт — синий с залитой иконкой, остальные — приглушённо-серые:
 *   Главная / Книжка / Услуги / Контакты
 *
 * «Книжка» (сервисная книжка) требует авторизации — для гостя пункт
 * скрываем (остаётся 3 пункта, ширина распределяется через flex-1).
 * Гараж доступен из меню профиля и из дашборда «Сервисной книжки».
 */
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/shared/lib/cn'

type IconName = 'home' | 'book' | 'service' | 'mail'

type Tab = {
  to: string
  label: string
  icon: IconName
  end?: boolean
  authOnly?: boolean
}

const TABS: Tab[] = [
  { to: '/', label: 'Главная', icon: 'home', end: true },
  { to: '/service-book', label: 'Книжка', icon: 'book', authOnly: true },
  { to: '/services', label: 'Услуги', icon: 'service' },
  { to: '/contacts', label: 'Контакты', icon: 'mail' },
]

export function MobileTabBar() {
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  const tabs = TABS.filter((t) => !t.authOnly || isAuthed)

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-borderLight bg-white shadow-[0_-2px_16px_rgba(24,32,42,0.06)] md:hidden"
      aria-label="Основная навигация"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex">
        {tabs.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-2.5 transition-colors',
                  isActive
                    ? 'text-brandBlue'
                    : 'text-slate-400 hover:text-textSecondary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <TabIcon name={tab.icon} active={isActive} />
                  <span
                    className={cn(
                      'text-[10px] uppercase tracking-wide',
                      isActive ? 'font-900' : 'font-bold',
                    )}
                  >
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

function TabIcon({ name, active }: { name: IconName; active: boolean }) {
  // Активная «Главная» — залитая иконка (по дизайну), остальные — контурные.
  if (name === 'home' && active) {
    return (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.03 2.59a1.5 1.5 0 011.94 0l7.5 6.363a1.5 1.5 0 01.53 1.144V19.5a1.5 1.5 0 01-1.5 1.5h-3.75a.75.75 0 01-.75-.75V14.25a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H4.5A1.5 1.5 0 013 19.5v-9.403c0-.44.194-.859.53-1.144l7.5-6.363z" />
      </svg>
    )
  }

  const stroke = 1.9
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {name === 'home' && (
        <>
          <path d="M3 9.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V9.5z" />
        </>
      )}
      {name === 'book' && (
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      )}
      {name === 'service' && (
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      )}
      {name === 'mail' && (
        <>
          <rect width="18" height="14" x="3" y="5" rx="2" />
          <path d="M3.5 7l7.55 5.3a1.7 1.7 0 001.9 0L20.5 7" />
        </>
      )}
    </svg>
  )
}
