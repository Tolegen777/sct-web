/**
 * Шапка сайта. Содержит лого, навигацию и блок пользователя справа.
 *
 * Для guest'а: кнопка «Войти» открывает модалку login (через query ?modal=login).
 * Для authed: показывается аватар с инициалами и быстрый доступ к ЛК.
 *
 * Активная ссылка подчёркивается синим — стилистика взята из мокапов.
 */
import { NavLink, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'

type NavItem = {
  to: string
  label: string
  end?: boolean
  authOnly?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Главная', end: true },
  { to: '/services', label: 'Услуги' },
  { to: '/service-book', label: 'Сервисная книжка', authOnly: true },
  { to: '/garage', label: 'Гараж', authOnly: true },
  { to: '/contacts', label: 'Контакты' },
]

function getInitials(profile: { first_name?: string; last_name?: string } | null): string {
  if (!profile) return '—'
  const f = profile.first_name?.charAt(0) ?? ''
  const l = profile.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || '—'
}

export function Header() {
  const phase = useAuthStore((s) => s.phase)
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const [, setSearchParams] = useSearchParams()
  const isAuthed = phase === 'authed'

  const openLogin = () => setSearchParams({ modal: 'login' })

  return (
    <header className="sticky top-0 z-40 border-b border-borderLight bg-white/90 backdrop-blur-md">
      <div className="container-sct flex h-16 items-center justify-between md:h-20">
        <div className="flex items-center gap-8 md:gap-12">
          <Link to="/" className="text-xl font-900 uppercase italic tracking-tight text-brandBlue md:text-2xl">
            SCT <span className="text-textPrimary">Service</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems
              .filter((item) => !item.authOnly || isAuthed)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'relative text-[11px] font-900 uppercase tracking-widest transition-colors',
                      isActive
                        ? 'text-brandBlue after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-brandBlue'
                        : 'text-textSecondary hover:text-brandBlue',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthed && profile ? (
            <>
              <div className="hidden text-right md:block">
                <p className="text-[12px] font-900 uppercase leading-none text-textPrimary">
                  {profile.first_name || profile.username || 'Клиент'}
                </p>
                <button
                  onClick={logout}
                  className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brandBlue hover:underline"
                >
                  Выйти
                </button>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-borderLight bg-surfaceLight text-sm font-900 text-brandBlue">
                {getInitials(profile)}
              </div>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={openLogin}>
              Войти
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
