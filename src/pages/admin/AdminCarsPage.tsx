/**
 * Заглушка раздела «Автомобили» в админке.
 *
 * Бэк-эндпоинты готовы (cars/cars-list-page-data/, cars/{source_id}/
 * detail-page-data/), но интерфейс ещё не собран — формат данных большой,
 * нужен полноценный билд таблицы со всеми фильтрами.
 *
 * Делаем заглушку с прозрачным сообщением + ссылкой назад, чтобы не было
 * 404 по клику в навигации.
 */
import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'

export default function AdminCarsPage() {
  return (
    <section className="container-admin py-10">
      <Card className="border-2 border-dashed border-borderLight p-10 text-center md:p-14">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-brandBlue">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          Раздел в разработке
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium italic text-textSecondary">
          Справочник модификаций (~99 173 шт) подключим в следующем релизе.
          Эндпоинты на бэке уже готовы — нужно собрать UI с фильтрами.
        </p>
        <Link to="/admin/packages" className="mt-8 inline-block">
          <Button variant="primary" size="lg">
            К пакетам услуг
          </Button>
        </Link>
      </Card>
    </section>
  )
}
