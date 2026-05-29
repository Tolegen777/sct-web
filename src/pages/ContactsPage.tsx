/**
 * Контакты и филиалы SCT Service (по дизайну new_screens).
 *
 * Layout: «Наши филиалы» — карта слева + список филиалов справа (на desktop),
 * под картой — панель единой справочной службы. На мобиле всё стопкой:
 * карта → справочная → карточки филиалов.
 *
 * Источник — GET /service_stations/. Часы выводим из расписания (сводно
 * «Ежедневно HH:MM–HH:MM», иначе — на сегодня). Соцсети — визуальные иконки
 * (отдельных ссылок бэк не отдаёт).
 */
import { Link } from 'react-router-dom'
import { useServiceStationsQuery } from '@/features/service-stations/queries'
import { BranchesMap } from '@/features/service-stations/BranchesMap'
import { GuestPrompt } from '@/features/auth/GuestPrompt'
import { useAuthStore } from '@/features/auth/store'
import { Card } from '@/shared/ui/Card'
import { Spinner } from '@/shared/ui/Spinner'
import { Button } from '@/shared/ui/Button'
import type { ServiceStation } from '@/features/service-stations/types'

export default function ContactsPage() {
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  const { data, isLoading, isError, refetch } = useServiceStationsQuery({ days: 7 })

  // Бэк сейчас требует JWT даже для филиалов (BACKEND_NOTES §3.3) — гостю
  // показываем приглашение. Когда сделают public — early-return уберём.
  if (!isAuthed) {
    return (
      <GuestPrompt
        title="Сеть филиалов SCT Service"
        description="Чтобы посмотреть адреса, расписание и записаться в ближайший филиал — войдите или зарегистрируйтесь."
      />
    )
  }

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
    <section className="container-sct py-6 md:py-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl font-900 uppercase tracking-tight text-textPrimary md:text-4xl">
          Наши филиалы
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-medium text-textSecondary md:text-base">
          Выберите филиал на карте или в списке для получения подробной
          информации, контактов и записи.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Левая колонка: карта + справочная */}
        <div className="space-y-4 lg:col-span-7">
          <BranchesMap
            stations={data.results}
            className="aspect-[4/3] overflow-hidden rounded-sct-lg border border-borderLight bg-surfaceLight md:aspect-[16/10]"
          />

          <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Единая справочная служба
              </p>
              <a
                href="tel:+77273334455"
                className="mt-1 block text-2xl font-900 tracking-tight text-textPrimary"
              >
                +7 (727) 333-44-55
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-surfaceMuted px-3 py-1.5 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Служба заботы 24/7
              </span>
              <span className="rounded-md bg-surfaceMuted px-3 py-1.5 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Алматы
              </span>
            </div>
          </Card>
        </div>

        {/* Правая колонка: список филиалов */}
        <div className="space-y-4 lg:col-span-5">
          {data.results.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      </div>
    </section>
  )
}

function stationHours(station: ServiceStation): string | null {
  const days = station.schedule ?? []
  const open = days.filter((d) => !d.is_closed)
  if (open.length === 0) return null
  const labels = new Set(open.map((d) => d.label))
  if (labels.size === 1) return `Ежедневно ${open[0].label}`
  const today = days.find((d) => d.is_today)
  if (today) return today.is_closed ? 'Сегодня выходной' : `Сегодня ${today.label}`
  return open[0].label
}

function StationCard({ station }: { station: ServiceStation }) {
  const hours = stationHours(station)
  return (
    <Card className="p-5">
      <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
        Сервис-центр
      </p>
      <h3 className="mt-1 text-lg font-900 uppercase tracking-tight text-textPrimary">
        {station.name}
      </h3>

      <ul className="mt-4 space-y-2.5 text-sm">
        <li className="flex items-start gap-3">
          <MapIcon />
          <span className="font-medium text-textPrimary">
            {station.city}, {station.address}
          </span>
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
        {hours && (
          <li className="flex items-start gap-3">
            <ClockIcon />
            <span className="font-medium text-textSecondary">{hours}</span>
          </li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-borderLight pt-4">
        <div className="flex gap-2">
          <SocialIcon kind="instagram" />
          <SocialIcon kind="whatsapp" />
        </div>
        <Link to="/services">
          <Button variant="primary" size="sm">
            Записаться на сервис
          </Button>
        </Link>
      </div>
    </Card>
  )
}

function MapIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SocialIcon({ kind }: { kind: 'instagram' | 'whatsapp' }) {
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full bg-surfaceMuted text-textSecondary"
      aria-hidden
    >
      {kind === 'instagram' ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="5" strokeWidth={2} />
          <circle cx="12" cy="12" r="4" strokeWidth={2} />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21l1.65-4.02A9 9 0 1112 21a8.96 8.96 0 01-4.34-1.11L3 21z" />
        </svg>
      )}
    </span>
  )
}
