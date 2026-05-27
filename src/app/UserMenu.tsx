/**
 * Выпадающее меню профиля в шапке (для авторизованного клиента).
 *
 * Триггер: клик по блоку «Пользователь / Имя» + аватарка.
 * Содержимое: 3 пункта — «Сервисная книжка», «Гараж», «Выйти».
 * Закрывается по: клик снаружи, Escape, переход по пункту.
 *
 * Профиль (`/profile`) пока нет (нет макета и API). Когда появится —
 * первым пунктом добавим.
 */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { cn } from '@/shared/lib/cn'

function getInitials(profile: { first_name?: string; last_name?: string } | null): string {
  if (!profile) return '—'
  const f = profile.first_name?.charAt(0) ?? ''
  const l = profile.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || '—'
}

export function UserMenu() {
  const profile = useAuthStore((s) => s.profile)
  const logout = useAuthStore((s) => s.logout)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Закрытие по клику снаружи и Escape.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!profile) return null

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/5"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="hidden text-right md:block">
          <p className="text-[10px] font-900 uppercase tracking-widest text-white/60">
            Пользователь
          </p>
          <p className="mt-0.5 text-[12px] font-900 uppercase leading-none text-white">
            {profile.first_name || profile.username || 'Клиент'}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-sm font-900 text-white backdrop-blur">
          {getInitials(profile)}
        </div>
        <svg
          className={cn(
            'hidden h-3 w-3 text-white/60 transition-transform md:block',
            open && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-sct border border-borderLight bg-white text-textPrimary shadow-soft-card animate-fade"
        >
          {/* Шапка меню: имя + телефон */}
          <div className="border-b border-borderLight bg-surfaceLight px-4 py-3">
            <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
              Аккаунт
            </p>
            <p className="mt-0.5 truncate text-sm font-900 uppercase italic tracking-tight">
              {profile.first_name} {profile.last_name}
            </p>
            {profile.phone && (
              <p className="mt-0.5 truncate font-mono text-[11px] text-textSecondary">
                {profile.phone}
              </p>
            )}
          </div>

          <ul className="py-1.5">
            <MenuItem to="/service-book" icon="book" onClose={() => setOpen(false)}>
              Сервисная книжка
            </MenuItem>
            <MenuItem to="/garage" icon="garage" onClose={() => setOpen(false)}>
              Гараж
            </MenuItem>
            <li
              className="cursor-not-allowed px-4 py-2.5 text-sm font-medium text-textSecondary/40"
              title="Профиль появится в следующем релизе"
            >
              <div className="flex items-center gap-3">
                <Icon name="user" />
                <span>Профиль</span>
                <span className="ml-auto text-[9px] font-bold uppercase tracking-widest">
                  скоро
                </span>
              </div>
            </li>
          </ul>

          <div className="border-t border-borderLight">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <Icon name="logout" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  to,
  icon,
  children,
  onClose,
}: {
  to: string
  icon: 'book' | 'garage' | 'user'
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClose}
        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-textPrimary transition-colors hover:bg-surfaceLight hover:text-brandBlue"
      >
        <Icon name={icon} />
        <span>{children}</span>
      </Link>
    </li>
  )
}

function Icon({ name }: { name: 'book' | 'garage' | 'user' | 'logout' }) {
  const paths: Record<string, string> = {
    book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    garage: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  }
  return (
    <svg className="h-4 w-4 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[name]} />
    </svg>
  )
}
