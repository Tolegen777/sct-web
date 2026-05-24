import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

/**
 * Empty-state для пустого гаража. Тон — приглашающий, не «ошибочный».
 */
export function EmptyGarage() {
  return (
    <div className="rounded-sct-lg border-2 border-dashed border-borderLight bg-surfaceLight/50 px-8 py-12 text-center md:px-14 md:py-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brandBlue shadow-sct-soft md:h-20 md:w-20">
        <svg
          className="h-8 w-8 md:h-10 md:w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
        Гараж пуст
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm font-medium italic text-textSecondary">
        Добавьте свой автомобиль, чтобы получить доступ к услугам, записям и
        сервисной книжке.
      </p>
      <div className="mt-8">
        <Link to="/garage/add">
          <Button size="lg" variant="dark">
            Добавить автомобиль
          </Button>
        </Link>
      </div>
    </div>
  )
}
