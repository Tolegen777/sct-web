/**
 * Страница 404 «не найдено».
 *
 * Большая стилизованная цифра 404, под ней — короткое объяснение,
 * быстрые кнопки на главные разделы сайта.
 */
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="container-sct flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <div className="relative">
        <h1 className="text-[120px] font-900 italic leading-none tracking-tighter text-brandBlue/10 md:text-[180px]">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-brandBlue shadow-soft-card md:h-24 md:w-24">
            <svg className="h-10 w-10 md:h-12 md:w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
        Страница не найдена
      </p>
      <h2 className="mt-4 text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
        Что-то пошло не туда
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-medium text-textSecondary md:text-base">
        Возможно, ссылка устарела или была введена с ошибкой. Попробуйте
        вернуться на главную или выбрать раздел ниже.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="lg">
            На главную
          </Button>
        </Link>
        <Link to="/services">
          <Button variant="secondary" size="lg">
            К услугам
          </Button>
        </Link>
        <Link to="/contacts">
          <Button variant="ghost" size="lg">
            Контакты
          </Button>
        </Link>
      </div>
    </section>
  )
}
