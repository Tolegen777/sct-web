/**
 * Дашборд под Hero для залогиненного клиента.
 *
 * Подгружает /service-book/page-data/, показывает 3 секции:
 *   1. Активное авто (CarHero из service-book)
 *   2. Рекомендация (если есть next_service_date)
 *   3. Ближайший визит + первые 2 запланированных
 *
 * История полностью на /service-book — здесь только preview.
 */
import { Link } from 'react-router-dom'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { CarHero } from '@/features/service-book/CarHero'
import { RecommendationCard } from '@/features/service-book/RecommendationCard'
import { AppointmentCard } from '@/features/service-book/AppointmentCard'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Spinner } from '@/shared/ui/Spinner'

export function AuthedDashboard() {
  const { data, isLoading } = useServiceBookQuery({ status: 'all', period: 'upcoming', limit: 5, offset: 0 })

  if (isLoading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!data) return null

  // Если нет авто — призываем добавить.
  if (data.page_state === 'NO_CARS') {
    return (
      <Card className="border-2 border-dashed border-borderLight p-10 text-center md:p-14">
        <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          Добавьте автомобиль
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm font-medium italic text-textSecondary">
          Сразу подберём пакеты и рекомендации под вашу модификацию.
        </p>
        <Link to="/garage/add" className="mt-8 inline-block">
          <Button variant="dark" size="lg">
            Добавить авто
          </Button>
        </Link>
      </Card>
    )
  }

  const upcoming = data.appointments
    .filter((a) => a.is_active && !a.is_cancelled && a.id !== data.next_appointment?.id)
    .slice(0, 2)

  return (
    <div className="space-y-6 md:space-y-8">
      {data.selected_car && (
        <CarHero car={data.selected_car} totalCars={data.cars.length} />
      )}

      {(data.summary.next_service_date || data.summary.last_service_date) && (
        <RecommendationCard
          nextServiceDate={data.summary.next_service_date}
          lastServiceDate={data.summary.last_service_date}
        />
      )}

      <Link
        to="/services"
        className="flex w-full items-center justify-center gap-3 rounded-sct bg-brandBlue py-5 text-sm font-900 uppercase italic tracking-[0.2em] text-white shadow-soft-blue transition-all hover:bg-brandBlueDark active:scale-[0.98]"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeWidth={2.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Записаться на сервис
      </Link>

      {(data.next_appointment || upcoming.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-900 uppercase italic tracking-[0.2em] text-textSecondary">
              Предстоящие визиты
            </h3>
            <Link
              to="/service-book"
              className="text-[10px] font-bold uppercase tracking-widest text-brandBlue hover:underline"
            >
              Все →
            </Link>
          </div>
          {data.next_appointment && (
            <AppointmentCard appointment={data.next_appointment} highlighted />
          )}
          {upcoming.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </section>
      )}
    </div>
  )
}
