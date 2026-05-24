/**
 * Карточка одного визита (записи на сервис) — для блока «Запланированные»
 * и «История». Активный визит выделяется тёмным фоном и пульсирующей точкой,
 * остальные — белой карточкой.
 */
import type { Appointment } from './types'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'

interface AppointmentCardProps {
  appointment: Appointment
  highlighted?: boolean
}

export function AppointmentCard({ appointment, highlighted }: AppointmentCardProps) {
  const datetime =
    appointment.final_datetime ??
    appointment.scheduled_datetime ??
    appointment.preferred_datetime

  const isActive = appointment.is_active
  const isCancelled = appointment.is_cancelled

  const tone: 'dark' | 'light' | 'muted' =
    highlighted || isActive ? 'dark' : isCancelled ? 'muted' : 'light'

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-sct-lg border p-5 transition-all md:p-6',
        tone === 'dark' && 'border-textPrimary bg-textPrimary text-white shadow-2xl',
        tone === 'light' && 'border-borderLight bg-white shadow-sct-soft hover:border-brandBlue/40',
        tone === 'muted' && 'border-borderLight bg-surfaceLight/40 text-textSecondary',
      )}
    >
      {tone === 'dark' && (
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brandBlue/20 blur-3xl" />
      )}

      <header className="relative z-10 mb-3 flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-900 uppercase italic tracking-widest',
            tone === 'dark' && 'bg-brandBlue text-white',
            tone === 'light' && 'bg-surfaceLight text-textSecondary',
            tone === 'muted' && 'bg-surfaceMuted text-textSecondary/70',
          )}
        >
          {tone === 'dark' && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brandYellow" />
          )}
          {appointment.status_label}
        </span>
      </header>

      <div className="relative z-10">
        <p
          className={cn(
            'text-2xl font-900 italic leading-none tracking-tighter',
            tone === 'dark' ? 'text-white' : 'text-textPrimary',
          )}
        >
          {formatDateTime(datetime)}
        </p>
        <p
          className={cn(
            'mt-2 text-sm font-bold uppercase italic tracking-tight',
            tone === 'dark' ? 'text-white' : 'text-textSecondary',
          )}
        >
          {appointment.service_package.title}
        </p>
        <div
          className={cn(
            'mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest',
            tone === 'dark' ? 'text-white/60' : 'text-textSecondary/60',
          )}
        >
          {appointment.car.title && <span>{appointment.car.title}</span>}
          {appointment.car.license_plate && (
            <>
              <span className="h-1 w-1 rounded-full bg-current opacity-50" />
              <span className="font-mono">{appointment.car.license_plate}</span>
            </>
          )}
          {appointment.service_package.display_price && (
            <>
              <span className="h-1 w-1 rounded-full bg-current opacity-50" />
              <span>{appointment.service_package.display_price}</span>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
