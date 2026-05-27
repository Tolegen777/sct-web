/**
 * Экран блокированного клиента.
 *
 * Показывается, когда `ClientProfile.status === 'BLOCKED'`. Сейчас бэк
 * пускает таких пользователей через login (по умолчанию Django пускает),
 * поэтому защиту делаем на фронте: в Layout проверяем статус и редиректим
 * на эту страницу.
 *
 * После того как бэк начнёт возвращать 403 на `/auth/profile/` для
 * BLOCKED-юзеров (и аналогично 401 на login) — фронт-защиту можно будет
 * упростить, но эта страница останется для информирования.
 */
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useAuthStore } from '@/features/auth/store'

export default function BlockedPage() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <section className="container-sct flex min-h-[70vh] flex-col items-center justify-center py-12">
      <Card className="max-w-lg p-8 text-center md:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 md:h-20 md:w-20">
          <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          Аккаунт заблокирован
        </h1>
        <p className="mt-3 text-sm font-medium text-textSecondary md:text-base">
          Доступ к личному кабинету временно ограничен. Свяжитесь с
          поддержкой, чтобы уточнить причину и восстановить доступ.
        </p>

        <div className="mt-6 rounded-sct border border-borderLight bg-surfaceLight p-4 text-left text-sm">
          <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            Колл-центр
          </p>
          <a
            href="tel:+77273334455"
            className="mt-1 block text-xl font-900 italic tracking-tighter text-brandBlue hover:underline"
          >
            +7 (727) 333-44-55
          </a>
          <p className="mt-1 text-[11px] text-textSecondary/70">
            Пн–Сб 09:00 – 20:00
          </p>
        </div>

        <Button variant="ghost" className="mt-6" onClick={() => logout()}>
          Выйти из аккаунта
        </Button>
      </Card>
    </section>
  )
}
