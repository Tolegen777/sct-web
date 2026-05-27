/**
 * Дружелюбный экран для гостя на тех страницах, где данные требуют auth.
 *
 * Сейчас три таких места (бэк требует JWT, хотя контент идеологически
 * публичный):
 *   - /services       (список пакетов)
 *   - /services/:id   (детальная пакета)
 *   - /contacts       (филиалы)
 *
 * Кнопки открывают глобальные модалки login/register через ?modal=...
 * Когда бэк сделает эти эндпоинты public — компонент можно будет не
 * показывать, и страницы заработают для гостя сразу.
 */
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

interface GuestPromptProps {
  title: string
  description: string
}

export function GuestPrompt({ title, description }: GuestPromptProps) {
  const [, setSearchParams] = useSearchParams()

  return (
    <section className="container-sct py-12">
      <Card className="mx-auto max-w-xl p-8 text-center md:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brandBlue/10 text-brandBlue md:h-20 md:w-20">
          <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0-1.105.895-2 2-2s2 .895 2 2-.895 2-2 2-2-.895-2-2zM12 11V7m0 8v2m0-2h-3m3 0h3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium text-textSecondary md:text-base">
          {description}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setSearchParams({ modal: 'register' })}
          >
            Зарегистрироваться
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setSearchParams({ modal: 'login' })}
          >
            У меня уже есть аккаунт
          </Button>
        </div>
      </Card>
    </section>
  )
}
