import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

export default function NotFoundPage() {
  return (
    <section className="container-sct flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
        Ошибка
      </p>
      <h1 className="mt-3 text-5xl font-900 uppercase italic tracking-tight text-textPrimary">
        404
      </h1>
      <p className="mt-3 max-w-sm text-textSecondary">
        Такой страницы нет. Возможно, она удалена или вы перешли по неверной ссылке.
      </p>
      <Link to="/" className="mt-8">
        <Button>На главную</Button>
      </Link>
    </section>
  )
}
