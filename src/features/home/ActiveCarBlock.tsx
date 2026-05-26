/**
 * Блок «АКТИВНОЕ АВТО» на главной.
 *
 * Структура:
 *   Header: заголовок «АКТИВНОЕ АВТО» + 2 кнопки справа («Сменить авто»,
 *           «Открыть гараж»).
 *   Body:   слева большое фото машины (соотношение 4:3),
 *           справа — название модификации, мелкая строка с тех. данными,
 *           3 плашки с тех. параметрами (Пробег / Замена масла / Ближайший
 *           визит) и жёлтая плашка-рекомендация с кнопкой «Посмотреть пакет».
 *
 * Данные подгружаем из `service-book/page-data/`:
 *   - selected_car          → название, фото, пробег
 *   - next_appointment      → ближайший визит
 *   - summary.next_service_date → дата рекомендации замены масла
 *
 * Если активного авто нет — компонент возвращает CTA-карточку «Добавьте авто».
 */
import { Link } from 'react-router-dom'
import { useServiceBookQuery } from '@/features/service-book/queries'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { Spinner } from '@/shared/ui/Spinner'
import { formatMileage, formatDate, formatDateTime } from '@/shared/lib/format'

export function ActiveCarBlock() {
  const { data, isLoading } = useServiceBookQuery({ status: 'all', period: 'upcoming', limit: 1, offset: 0 })

  if (isLoading) {
    return (
      <Card className="flex min-h-[280px] items-center justify-center">
        <Spinner />
      </Card>
    )
  }

  if (!data || data.page_state === 'NO_CARS' || !data.selected_car) {
    return (
      <Card className="border-2 border-dashed border-borderLight p-8 text-center md:p-12">
        <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
          В гараже пусто
        </p>
        <h3 className="mt-3 text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
          Добавьте автомобиль
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium italic text-textSecondary">
          Сразу подберём пакеты и рекомендации под вашу модификацию.
        </p>
        <Link to="/garage/add" className="mt-6 inline-block">
          <Button variant="dark" size="lg">
            Добавить автомобиль
          </Button>
        </Link>
      </Card>
    )
  }

  const car = data.selected_car
  const nextVisitDt =
    data.next_appointment?.final_datetime ??
    data.next_appointment?.scheduled_datetime ??
    data.next_appointment?.preferred_datetime
  const carTitle = `${car.mark.display_name} ${car.model.name}`.toUpperCase()
  const carShortSpecs = car.generation?.name
    ? car.generation.name + (car.configuration?.name ? ` · ${car.configuration.name}` : '')
    : car.configuration?.name ?? ''

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-borderLight bg-white px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5">
        <div>
          <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            Активное авто
          </p>
          <p className="mt-0.5 text-[11px] font-medium italic text-textSecondary/80">
            Основной автомобиль, для которого подбираются пакеты и акции.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.cars.length > 1 && (
            <Link
              to="/garage"
              className="rounded-lg border border-borderLight bg-white px-3 py-2 text-[10px] font-900 uppercase tracking-widest text-textSecondary transition-all hover:border-brandBlue hover:text-brandBlue"
            >
              Сменить авто
            </Link>
          )}
          <Link
            to="/garage"
            className="rounded-lg bg-brandBlue px-3 py-2 text-[10px] font-900 uppercase tracking-widest text-white transition-all hover:bg-brandBlueDark"
          >
            Открыть гараж
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-12 md:gap-6 md:p-6">
        {/* Фото машины слева */}
        <div className="md:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sct border border-borderLight bg-surfaceLight">
            <SafeImage
              src={car.image_url ?? undefined}
              alt={carTitle}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-4xl font-900 uppercase italic text-borderLight">
                  {car.mark.name.slice(0, 2)}
                </div>
              }
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-md bg-brandBlue px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-white shadow">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brandYellow" />
              Активное авто
            </span>
          </div>
        </div>

        {/* Данные машины и плашки */}
        <div className="md:col-span-7">
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            {carTitle}
          </h2>
          {carShortSpecs && (
            <p className="mt-1 text-[12px] font-bold uppercase tracking-tight text-textSecondary">
              {carShortSpecs}
            </p>
          )}

          <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
            <SpecChip
              label="Пробег"
              value={
                typeof car.latest_mileage_km === 'number' && car.latest_mileage_km > 0
                  ? formatMileage(car.latest_mileage_km)
                  : '—'
              }
            />
            <SpecChip
              label="Замена масла в ДВС"
              value={
                data.summary.next_service_date
                  ? formatDate(data.summary.next_service_date)
                  : '—'
              }
            />
            <SpecChip
              label="Ближайший визит"
              value={nextVisitDt ? formatDateTime(nextVisitDt) : 'Нет'}
              accent={Boolean(nextVisitDt)}
            />
          </div>

          {/* Рекомендация-плашка */}
          {data.summary.next_service_date && (
            <RecommendationStrip
              recommendationDate={data.summary.next_service_date}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

function SpecChip({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-sct border border-borderLight bg-surfaceLight px-3 py-2.5">
      <p className="truncate text-[9px] font-900 uppercase tracking-widest text-textSecondary">
        {label}
      </p>
      <p
        className={
          'mt-0.5 text-base font-900 italic leading-none tracking-tighter ' +
          (accent ? 'text-brandBlue' : 'text-textPrimary')
        }
      >
        {value}
      </p>
    </div>
  )
}

function RecommendationStrip({ recommendationDate }: { recommendationDate: string }) {
  return (
    <div className="mt-5 flex flex-col items-start gap-3 rounded-sct border-l-4 border-brandYellow bg-brandYellow/15 p-3 md:flex-row md:items-center md:justify-between md:p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-xl">⏳</div>
        <p className="text-[12px] font-bold uppercase tracking-tight text-textPrimary">
          К <span className="text-brandBlue">{formatDate(recommendationDate)}</span> желательно заменить
          <span className="text-brandBlue"> масло в двигателе</span>.
        </p>
      </div>
      <Link
        to="/services"
        className="shrink-0 rounded-md bg-textPrimary px-3 py-2 text-[10px] font-900 uppercase tracking-widest text-white hover:bg-brandBlue"
      >
        Посмотреть пакет
      </Link>
    </div>
  )
}
