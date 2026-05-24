/**
 * «Сервисная книжка» — главный экран ЛК клиента.
 *
 * Источник данных: GET /service-book/page-data/ с query-params:
 *   - car_id  (по умолчанию — активное авто клиента)
 *   - status  (all/active/completed/cancelled)
 *   - period  (all/upcoming/past/month/year)
 *   - limit/offset (пагинация истории)
 *
 * Фильтры status и period живут в URL — для deep-link'а и back-кнопки.
 * `page_state` определяет, какие секции показывать:
 *
 *   NO_CARS                     — гараж пуст, CTA «Добавить авто»
 *   NO_SERVICE_HISTORY          — авто есть, записей и истории нет
 *   HAS_ACTIVE_APPOINTMENTS     — есть активная запись
 *   HAS_SERVICE_HISTORY         — есть только история
 *
 * Активные и прошлые визиты бэк отдаёт одним массивом `appointments`, мы
 * сами разделяем по `is_active` / `is_cancelled` / по дате.
 */
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { CarHero } from '@/features/service-book/CarHero'
import { RecommendationCard } from '@/features/service-book/RecommendationCard'
import { AppointmentCard } from '@/features/service-book/AppointmentCard'
import { ServiceBookFiltersBar } from '@/features/service-book/ServiceBookFilters'
import { SummaryStats } from '@/features/service-book/SummaryStats'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import type { Appointment } from '@/features/service-book/types'

const DEFAULT_LIMIT = 20

export default function ServiceBookPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') ?? 'all'
  const period = searchParams.get('period') ?? 'all'

  const query = useMemo(
    () => ({ status, period, limit: DEFAULT_LIMIT, offset: 0 }),
    [status, period],
  )

  const { data, isLoading, isError, refetch } = useServiceBookQuery(query)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <section className="container-sct py-12">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Не удалось загрузить сервисную книжку.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
            Повторить
          </Button>
        </Card>
      </section>
    )
  }

  return (
    <section className="container-sct max-w-[1000px] py-8 md:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:text-5xl">
          Сервисная книжка
        </h1>
        {data.client.full_name && (
          <p className="mt-2 text-sm font-medium italic text-textSecondary md:text-base">
            {data.client.full_name}
          </p>
        )}
      </header>

      {data.page_state === 'NO_CARS' ? (
        <NoCarsState />
      ) : (
        <div className="space-y-8 md:space-y-10">
          {data.selected_car && (
            <CarHero car={data.selected_car} totalCars={data.cars.length} />
          )}

          {(data.summary.next_service_date || data.summary.last_service_date) && (
            <RecommendationCard
              nextServiceDate={data.summary.next_service_date}
              lastServiceDate={data.summary.last_service_date}
            />
          )}

          <SummaryStats summary={data.summary} />

          <BookServiceCta bookUrl="/services" />

          <ServiceBookFiltersBar filters={data.filters} />

          <Appointments
            appointments={data.appointments}
            nextAppointment={data.next_appointment}
          />
        </div>
      )}
    </section>
  )
}

function NoCarsState() {
  return (
    <Card className="border-2 border-dashed border-borderLight p-10 text-center md:p-16">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surfaceLight text-brandBlue shadow-sct-soft md:h-20 md:w-20">
        <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        Добавьте автомобиль, чтобы SCT Service сохранял историю обслуживания
        и рекомендовал следующие работы.
      </p>
      <Link to="/garage/add" className="mt-8 inline-block">
        <Button variant="dark" size="lg">
          Добавить автомобиль
        </Button>
      </Link>
    </Card>
  )
}

function BookServiceCta({ bookUrl }: { bookUrl: string }) {
  return (
    <Link
      to={bookUrl}
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
  )
}

function Appointments({
  appointments,
  nextAppointment,
}: {
  appointments: Appointment[]
  nextAppointment: Appointment | null
}) {
  // Бэк отдаёт всё одним массивом `appointments`. Разделяем сами:
  //  - upcoming: is_active && не отменены
  //  - past:     остальные (выполненные / отменённые)
  // nextAppointment может дублировать запись из appointments — отфильтруем.
  const upcoming = appointments.filter(
    (a) => a.is_active && !a.is_cancelled && a.id !== nextAppointment?.id,
  )
  const past = appointments.filter((a) => !a.is_active || a.is_cancelled)

  if (!nextAppointment && appointments.length === 0) {
    return (
      <Card className="border-2 border-dashed border-borderLight bg-surfaceLight/30 p-12 text-center italic">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl text-textSecondary/30 shadow-inner">
          📄
        </div>
        <h3 className="text-xl font-900 uppercase tracking-tight text-textPrimary">
          Записей и истории пока нет
        </h3>
        <p className="mt-3 text-sm font-medium text-textSecondary opacity-60">
          Здесь появятся ваши записи и выполненные работы.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {nextAppointment && (
        <section>
          <h3 className="mb-3 text-[11px] font-900 uppercase italic tracking-[0.2em] text-textSecondary">
            Ближайший визит
          </h3>
          <AppointmentCard appointment={nextAppointment} highlighted />
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[11px] font-900 uppercase italic tracking-[0.2em] text-textSecondary">
            Запланированные визиты
          </h3>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-[11px] font-900 uppercase italic tracking-[0.2em] text-textSecondary">
            История обслуживания
          </h3>
          <div className="space-y-3">
            {past.map((a) => (
              <AppointmentCard key={a.id} appointment={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
