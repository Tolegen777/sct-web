/**
 * Контакты и филиалы SCT Service.
 *
 * Пока чистая статика — бэк не отдаёт филиалы отдельным эндпоинтом
 * (booking flow ещё не закончен). Данные взяты из HTML-мокапа
 * `client/services/package_booking_workflow_v1.html`, который дизайнер
 * нарисовал как 4 точки.
 *
 * Когда бэк добавит `GET /branches/` — заменим массив на запрос +
 * подключим интерактивную карту (2GIS / Google).
 */
import { Card } from '@/shared/ui/Card'

interface Branch {
  name: string
  address: string
  district: string
  phone: string
  workingHours: string
  features: string[]
}

const BRANCHES: Branch[] = [
  {
    name: 'SCT Самал',
    address: 'мкр. Самал-2, 31',
    district: 'Медеуский район',
    phone: '+7 (727) 333-44-55',
    workingHours: 'Пн–Сб 09:00 – 20:00 · Вс 10:00 – 18:00',
    features: ['Замена масла', 'Тормозная система', 'Диагностика'],
  },
  {
    name: 'SCT Жетысу',
    address: 'мкр. Жетысу-4, 18',
    district: 'Ауэзовский район',
    phone: '+7 (727) 333-44-56',
    workingHours: 'Пн–Сб 09:00 – 20:00 · Вс 10:00 – 18:00',
    features: ['Замена масла', 'АКПП', 'Шиномонтаж'],
  },
  {
    name: 'SCT Рыскулова',
    address: 'пр. Рыскулова, 57/1',
    district: 'Жетысуский район',
    phone: '+7 (727) 333-44-57',
    workingHours: 'Пн–Сб 09:00 – 20:00 · Вс 10:00 – 18:00',
    features: ['Полное ТО', 'Тормозная система', 'Подвеска'],
  },
  {
    name: 'SCT Сайран',
    address: 'ул. Варламова, 1А',
    district: 'Алмалинский район',
    phone: '+7 (727) 333-44-58',
    workingHours: 'Пн–Сб 09:00 – 20:00 · Вс 10:00 – 18:00',
    features: ['Замена масла', 'Антифриз', 'Диагностика'],
  },
]

export default function ContactsPage() {
  return (
    <section className="container-sct space-y-10 py-8 md:py-12">
      <header>
        <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
          Контакты
        </p>
        <h1 className="mt-2 text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:text-5xl">
          Найдите ближайший<br className="hidden md:inline" /> филиал SCT
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium text-textSecondary md:text-base">
          В Алматы работают 4 сервисных центра. Все филиалы оснащены
          одинаково — выбирайте удобное расположение и записывайтесь онлайн.
        </p>
      </header>

      {/* Заглушка карты — потом подменим интерактивной 2GIS */}
      <Card className="aspect-[16/7] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-surfaceLight p-0">
        <div className="flex h-full items-center justify-center text-center">
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brandBlue/10 text-brandBlue">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p className="text-base font-900 uppercase italic tracking-tight text-textPrimary">
              Интерактивная карта
            </p>
            <p className="mt-1 text-xs font-medium text-textSecondary">
              Подключим 2GIS на следующем релизе.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {BRANCHES.map((branch) => (
          <Card key={branch.name} className="p-6">
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
                  {branch.district}
                </p>
                <h3 className="mt-1 text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
                  {branch.name}
                </h3>
              </div>
              <span className="rounded-md bg-green-50 px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-green-700">
                Открыт
              </span>
            </header>

            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Icon name="map" />
                <span className="font-bold text-textPrimary">{branch.address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="phone" />
                <a
                  href={`tel:${branch.phone.replace(/[^+\d]/g, '')}`}
                  className="font-bold text-brandBlue hover:underline"
                >
                  {branch.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="clock" />
                <span className="text-textSecondary">{branch.workingHours}</span>
              </li>
            </ul>

            <div className="mt-5 flex flex-wrap gap-1.5 border-t border-borderLight pt-4">
              {branch.features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-md bg-surfaceLight px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-textSecondary"
                >
                  {feature}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-textPrimary p-6 text-white md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-900 uppercase tracking-widest text-brandYellow">
              Колл-центр
            </p>
            <h3 className="mt-2 text-2xl font-900 uppercase italic tracking-tight md:text-3xl">
              Не получается записаться онлайн?
            </h3>
            <p className="mt-2 text-sm font-medium opacity-80">
              Позвоните единым номером — оператор подберёт услугу и время.
            </p>
          </div>
          <a
            href="tel:+77273334455"
            className="inline-flex items-center gap-3 rounded-sct bg-brandYellow px-6 py-4 text-base font-900 uppercase italic tracking-widest text-textPrimary shadow-lg transition-transform hover:scale-[1.02]"
          >
            <Icon name="phone" tone="dark" />
            +7 (727) 333-44-55
          </a>
        </div>
      </Card>
    </section>
  )
}

function Icon({ name, tone = 'muted' }: { name: 'map' | 'phone' | 'clock'; tone?: 'muted' | 'dark' }) {
  const cls = tone === 'dark' ? 'text-textPrimary' : 'text-textSecondary/60'
  if (name === 'map')
    return (
      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  if (name === 'phone')
    return (
      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )
  return (
    <svg className={`mt-0.5 h-4 w-4 shrink-0 ${cls}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
