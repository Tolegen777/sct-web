/**
 * Контакты и филиалы SCT Service.
 *
 * Источник — `GET /api/v1/client_endpoints/service_stations/`. Бэк
 * возвращает список филиалов с расписанием (по умолчанию на 7 дней).
 *
 * Города группируем — в дизайне группировки нет, но 6 филиалов
 * растянутых по 4 городам читать проще.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useServiceStationsQuery } from '@/features/service-stations/queries'
import { BranchesMap } from '@/features/service-stations/BranchesMap'
import { GuestPrompt } from '@/features/auth/GuestPrompt'
import { useAuthStore } from '@/features/auth/store'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { ServiceStation, StationScheduleDay } from '@/features/service-stations/types'

export default function ContactsPage() {
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  const { data, isLoading, isError, refetch } = useServiceStationsQuery({ days: 7 })

  // Бэк сейчас требует JWT даже для филиалов — показываем гостю приглашение.
  // Когда сделают эндпоинт public — этот early-return уберём.
  if (!isAuthed) {
    return (
      <GuestPrompt
        title="Сеть филиалов SCT Service"
        description="Чтобы посмотреть адреса, расписание и записаться в ближайший филиал — войдите или зарегистрируйтесь."
      />
    )
  }

  // Группируем по городу для удобства
  const byCity = useMemo(() => {
    if (!data?.results) return []
    const map = new Map<string, ServiceStation[]>()
    for (const s of data.results) {
      const arr = map.get(s.city) ?? []
      arr.push(s)
      map.set(s.city, arr)
    }
    return Array.from(map.entries())
  }, [data])

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
          <p className="font-bold text-red-700">Не удалось загрузить филиалы.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
            Повторить
          </Button>
        </Card>
      </section>
    )
  }

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
          В сети {data.count} сервисных центров. Все филиалы оснащены
          одинаково — выбирайте удобное расположение и записывайтесь онлайн.
        </p>
      </header>

      {/* Yandex Maps со всеми филиалами */}
      <BranchesMap stations={data.results} />

      {/* Филиалы — группированно по городам */}
      {byCity.map(([city, stations]) => (
        <section key={city}>
          <h2 className="mb-5 text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
            {city}
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {stations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </section>
      ))}

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
            <PhoneIcon tone="dark" />
            +7 (727) 333-44-55
          </a>
        </div>
      </Card>
    </section>
  )
}

function StationCard({ station }: { station: ServiceStation }) {
  return (
    <Card className="p-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
            {station.city}
          </p>
          <h3 className="mt-1 text-lg font-900 uppercase italic tracking-tight text-textPrimary md:text-xl">
            {station.name}
          </h3>
        </div>
        <StatusBadge station={station} />
      </header>

      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <MapIcon />
          <span className="font-bold text-textPrimary">{station.address}</span>
        </li>
        {station.phone && (
          <li className="flex items-start gap-3">
            <PhoneIcon />
            <a
              href={`tel:${station.phone.replace(/[^+\d]/g, '')}`}
              className="font-bold text-brandBlue hover:underline"
            >
              {station.phone}
            </a>
          </li>
        )}
      </ul>

      {station.schedule && station.schedule.length > 0 && (
        <div className="mt-5 border-t border-borderLight pt-4">
          <p className="mb-3 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            Расписание на неделю
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {station.schedule.slice(0, 7).map((day) => (
              <ScheduleDay key={day.date} day={day} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3 border-t border-borderLight pt-4">
        <Link to="/services" className="flex-1">
          <Button variant="primary" size="sm" fullWidth>
            Записаться
          </Button>
        </Link>
        {station.latitude && station.longitude && (
          <a
            href={`https://yandex.kz/maps/?pt=${station.longitude},${station.latitude}&z=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sct border border-borderLight bg-white px-4 py-2 text-[11px] font-900 uppercase tracking-widest text-textSecondary transition-all hover:border-brandBlue hover:text-brandBlue"
          >
            На карте
          </a>
        )}
      </div>
    </Card>
  )
}

function StatusBadge({ station }: { station: ServiceStation }) {
  const today = station.schedule?.find((d) => d.is_today)
  const isOpen = today && !today.is_closed && today.available
  return (
    <span
      className={cn(
        'shrink-0 rounded-md px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest',
        isOpen
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700',
      )}
    >
      {isOpen ? 'Открыт' : 'Закрыт'}
    </span>
  )
}

function ScheduleDay({ day }: { day: StationScheduleDay }) {
  const dayNum = day.date.split('-')[2]
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-md border px-1.5 py-2 text-center transition-colors',
        day.is_today
          ? 'border-brandBlue bg-blue-50'
          : day.is_closed
          ? 'border-borderLight bg-surfaceLight/40 opacity-50'
          : 'border-borderLight bg-surfaceLight/60',
      )}
      title={day.label}
    >
      <span
        className={cn(
          'text-[9px] font-900 uppercase tracking-widest',
          day.is_today ? 'text-brandBlue' : 'text-textSecondary',
        )}
      >
        {day.weekday_label.slice(0, 2)}
      </span>
      <span
        className={cn(
          'mt-0.5 text-sm font-900 italic leading-none',
          day.is_today ? 'text-brandBlue' : 'text-textPrimary',
        )}
      >
        {dayNum}
      </span>
      {day.is_closed && (
        <span className="mt-1 text-[8px] font-bold uppercase text-textSecondary/70">
          вых
        </span>
      )}
    </div>
  )
}

function MapIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PhoneIcon({ tone }: { tone?: 'dark' }) {
  return (
    <svg
      className={cn(
        'mt-0.5 h-4 w-4 shrink-0',
        tone === 'dark' ? 'text-textPrimary' : 'text-textSecondary/60',
      )}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
      />
    </svg>
  )
}
