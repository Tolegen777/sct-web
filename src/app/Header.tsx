/**
 * Шапка сайта. Тёмно-синий navy фон, белое лого и навигация.
 *
 * Стилистика взята из обновлённого дизайна (new_screens/Главная *):
 *   - sticky тёмный фон `bg-navy`
 *   - белое лого SCT
 *   - белые ссылки навигации; активный пункт = белая плашка с тёмным текстом
 *   - правый блок: guest → светлая кнопка «Войти» (bg-white, text-navy);
 *                   authed → блок «ПОЛЬЗОВАТЕЛЬ / username» + кружок-аватар
 *
 * Активный пункт — выделяется белым «pill» (rounded-lg bg-white text-navy),
 * остальные — белые ссылки с opacity-70 и hover до 100%.
 */
import { NavLink, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { UserMenu } from './UserMenu'
import { cn } from '@/shared/lib/cn'

type NavItem = {
  to: string
  label: string
  end?: boolean
  authOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Главная', end: true },
  { to: '/garage', label: 'Гараж', authOnly: true },
  { to: '/services', label: 'Услуги' },
  { to: '/contacts', label: 'Контакты' },
]

export function Header() {
  const phase = useAuthStore((s) => s.phase)
  const [, setSearchParams] = useSearchParams()
  const isAuthed = phase === 'authed'

  const openLogin = () => setSearchParams({ modal: 'login' })

  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="container-sct flex h-16 items-center justify-between md:h-20">
        {/* Логотип */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-900 uppercase tracking-tight text-white md:text-2xl"
          aria-label="SCT Service — на главную"
        >
          <span className="rounded-full border-2 border-white px-2 py-0.5 text-sm md:text-base">
            SCT
          </span>
        </Link>

        {/* Навигация (центр) */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems
            .filter((item) => !item.authOnly || isAuthed)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-2 text-[11px] font-900 uppercase tracking-widest transition-colors',
                    isActive
                      ? 'bg-white text-navy shadow-md'
                      : 'text-white/70 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* Правая часть */}
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <UserMenu />
          ) : (
            <button
              onClick={openLogin}
              className="rounded-lg bg-white px-5 py-2 text-[11px] font-900 uppercase tracking-widest text-navy shadow-md transition-all hover:bg-brandYellow hover:text-textPrimary"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
