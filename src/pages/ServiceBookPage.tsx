/**
 * Сервисная книжка — главный экран ЛК клиента (dashboard).
 *
 * Layout: двухколоночный (8/4):
 *   Left:  CarHeroCompact → RecommendationStrip → BookServiceCTA →
 *          «Ближайший визит» (тёмная карточка) → «Запланированные визиты» →
 *          «Журнал обслуживания»
 *   Right: MyGarageColumn (тот же, что на главной)
 *
 * Состояния `page_state`:
 *   NO_CARS                     — CTA «Добавить авто», правая колонка скрыта
 *   NO_SERVICE_HISTORY          — секции пустые, но dashboard виден
 *   HAS_ACTIVE_APPOINTMENTS     — есть активные визиты
 *   HAS_SERVICE_HISTORY         — есть история
 *
 * Бэк отдаёт `appointments[]` единым массивом; разделяем по
 * `is_active`/`is_cancelled` для секций «Запланированные» и «Журнал».
 */
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { CarHeroCompact } from '@/features/service-book/CarHeroCompact'
import { RecommendationStrip } from '@/features/service-book/RecommendationStrip'
import { BookServiceCTA } from '@/features/service-book/BookServiceCTA'
import { AppointmentRow } from '@/features/service-book/AppointmentRow'
import { HistorySection } from '@/features/service-book/HistorySection'
import { MyGarageColumn } from '@/features/home/MyGarageColumn'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'

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
      <section className="container-sct py-6 md:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-5 lg:col-span-8">
            <Skeleton.Card className="h-32" />
            <Skeleton.Box className="h-16" />
            <Skeleton.Box className="h-14" />
            <Skeleton.Card className="h-28" />
            <Skeleton.Card className="h-40" />
          </div>
          <aside className="lg:col-span-4">
            <Skeleton.Card className="h-80" />
          </aside>
        </div>
      </section>
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

  // Состояние «нет авто» — одна колонка с CTA.
  if (data.page_state === 'NO_CARS' || !data.selected_car) {
    return (
      <section className="container-sct max-w-[800px] py-12">
        <NoCarsState />
      </section>
    )
  }

  // Разделяем appointments на активные и завершённые
  const upcoming = data.appointments
    .filter((a) => a.is_active && !a.is_cancelled && a.id !== data.next_appointment?.id)
  const history = data.appointments.filter((a) => !a.is_active || a.is_cancelled)

  return (
    <section className="container-sct py-6 md:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Основная колонка */}
        <div className="space-y-5 lg:col-span-8 lg:space-y-6">
          <CarHeroCompact car={data.selected_car} />

          <RecommendationStrip nextServiceDate={data.summary.next_service_date} />

          <BookServiceCTA />

          {/* Ближайший визит — выделенный */}
          {data.next_appointment && (
            <section>
              <h3 className="mb-3 text-[11px] font-900 uppercase italic tracking-[0.2em] text-textSecondary">
                Ближайшие визиты
              </h3>
              <AppointmentRow appointment={data.next_appointment} highlighted />
            </section>
          )}

          {/* Запланированные */}
          {upcoming.length > 0 && (
            <section>
              <h3 className="mb-3 text-[11px] font-900 uppercase italic tracking-[0.2em] text-textSecondary">
                Запланированные визиты
              </h3>
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} />
                ))}
              </div>
            </section>
          )}

          {/* Журнал */}
          <HistorySection history={history} />
        </div>

        {/* Правая колонка */}
        <aside className="lg:col-span-4">
          <MyGarageColumn />
        </aside>
      </div>
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
