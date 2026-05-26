/**
 * Строка-карточка одного визита.
 *
 * Светлая карточка с тонкой границей, слева — крупное время (14:30) и
 * мелким текстом дата. Под временем — название услуги.
 * Справа — кнопка «Детали» (или «Изменить» для активного).
 *
 * Для самого ближайшего/активного визита используется вариант с тёмным
 * navy-фоном (`highlighted`) — выделяется на фоне остальных.
 */
import { Link } from 'react-router-dom'
import type { Appointment } from './types'
import { cn } from '@/shared/lib/cn'

interface AppointmentRowProps {
  appointment: Appointment
  highlighted?: boolean
}

export function AppointmentRow({ appointment, highlighted }: AppointmentRowProps) {
  const datetime =
    appointment.final_datetime ??
    appointment.scheduled_datetime ??
    appointment.preferred_datetime

  const isHighlighted = highlighted || appointment.is_active
  const isCancelled = appointment.is_cancelled

  // Парсим время и дату для двух-строчного отображения
  const dt = datetime ? new Date(datetime) : null
  const time = dt
    ? dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : '—'
  const dateLabel = dt
    ? dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' })
    : '—'

  return (
    <Link
      to={`/bookings/${appointment.id}`}
      className={cn(
        'flex items-center justify-between gap-4 rounded-sct border p-4 transition-all md:p-5',
        isHighlighted
          ? 'border-textPrimary bg-textPrimary text-white shadow-2xl hover:bg-navy'
          : isCancelled
          ? 'border-borderLight bg-surfaceLight/40 text-textSecondary'
          : 'border-borderLight bg-white hover:-translate-y-0.5 hover:border-brandBlue/40 hover:shadow-soft-card',
      )}
    >
      {isHighlighted && (
        <span className="absolute top-3 right-3 rounded-md bg-brandBlue px-2 py-0.5 text-[9px] font-900 uppercase tracking-widest text-white">
          Ближайший визит
        </span>
      )}

      <div className="flex min-w-0 items-baseline gap-4">
        <div className="text-right">
          <p
            className={cn(
              'text-3xl font-900 italic leading-none tracking-tighter md:text-4xl',
              isHighlighted ? 'text-white' : 'text-textPrimary',
            )}
          >
            {time}
          </p>
          <p
            className={cn(
              'mt-1 text-[10px] font-bold uppercase tracking-widest',
              isHighlighted ? 'text-white/60' : 'text-textSecondary/70',
            )}
          >
            {dateLabel}
          </p>
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'truncate text-sm font-900 uppercase italic tracking-tight md:text-base',
              isHighlighted ? 'text-white' : 'text-textPrimary',
            )}
          >
            {appointment.service_package.title}
          </p>
          {appointment.car.title && (
            <p
              className={cn(
                'mt-1 truncate text-[10px] font-bold uppercase tracking-widest',
                isHighlighted ? 'text-white/60' : 'text-textSecondary/70',
              )}
            >
              {appointment.car.title}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-[10px] font-900 uppercase tracking-widest transition-all',
            isHighlighted
              ? 'border-white/30 bg-white/10 text-white'
              : 'border-borderLight bg-white text-textSecondary',
          )}
        >
          {isHighlighted ? 'Изменить' : 'Детали'}
        </span>
      </div>
    </Link>
  )
}
