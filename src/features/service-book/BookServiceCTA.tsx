/**
 * Большая синяя кнопка «Записаться на сервис» — отдельным блоком на всю
 * ширину основной колонки. По клику ведёт на /services (выбор пакета),
 * откуда уже на /services/:id/book.
 */
import { Link } from 'react-router-dom'

export function BookServiceCTA() {
  return (
    <Link
      to="/services"
      className="flex w-full items-center justify-center gap-3 rounded-sct bg-brandBlue px-6 py-4 text-sm font-900 uppercase tracking-[0.2em] text-white shadow-soft-blue transition-all hover:bg-brandBlueDark active:scale-[0.98] md:py-5"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeWidth={2.5}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Записаться на сервис
    </Link>
  )
}
