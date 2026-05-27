/**
 * Утилиты wizard'а записи на сервис.
 *
 * Бэк не отдаёт временных слотов — только часы работы (opens_at/closes_at)
 * на каждый день в schedule филиала. Слоты строим сами с шагом 30 минут.
 * Когда бэк подключит `/slots/?date=&service_station_id=&duration_min=` —
 * заменим `buildTimeSlots` на запрос к API, всё остальное останется как есть.
 */
import type { StationScheduleDay } from '@/features/service-stations/types'

export interface TimeSlot {
  /** ISO в локальной таймзоне, формат `YYYY-MM-DDTHH:mm` */
  localIso: string
  /** Лейбл для UI — `09:30` */
  label: string
  /** Час начала слота (для сегментации «утро/день/вечер») */
  hour: number
  /** Если слот в прошлом — блокируем (только для is_today) */
  inPast?: boolean
}

const SLOT_STEP_MIN = 30

/**
 * Строим временные слоты из расписания дня.
 * Возвращает пустой массив для is_closed дней.
 *
 * @param day        — день из schedule филиала
 * @param firstAllowed — самое раннее допустимое время (для is_today: now+30min)
 */
export function buildTimeSlots(day: StationScheduleDay, firstAllowed?: Date): TimeSlot[] {
  if (day.is_closed || !day.available) return []
  const [openH, openM] = day.opens_at.split(':').map((s) => Number(s))
  const [closeH, closeM] = day.closes_at.split(':').map((s) => Number(s))
  const [year, month, dayNum] = day.date.split('-').map((s) => Number(s))

  const slots: TimeSlot[] = []
  let h = openH
  let m = openM
  while (h < closeH || (h === closeH && m <= closeM - SLOT_STEP_MIN)) {
    const slotDate = new Date(year, month - 1, dayNum, h, m)
    const localIso =
      `${year}-${pad(month)}-${pad(dayNum)}T${pad(h)}:${pad(m)}`
    const inPast = firstAllowed ? slotDate.getTime() < firstAllowed.getTime() : false
    slots.push({
      localIso,
      label: `${pad(h)}:${pad(m)}`,
      hour: h,
      inPast,
    })
    m += SLOT_STEP_MIN
    if (m >= 60) {
      m -= 60
      h += 1
    }
  }
  return slots
}

/** Разделяем слоты на «Утро / День / Вечер» как в дизайне booking_workflow. */
export function groupSlotsByPeriod(slots: TimeSlot[]) {
  const morning = slots.filter((s) => s.hour < 12)
  const day = slots.filter((s) => s.hour >= 12 && s.hour < 18)
  const evening = slots.filter((s) => s.hour >= 18)
  return { morning, day, evening }
}

/**
 * Конвертирует «YYYY-MM-DDTHH:mm» в локальной таймзоне в ISO 8601 UTC,
 * который ждёт бэк. JS new Date() с такой строкой понимает её как local.
 */
export function localIsoToUtcIso(localIso: string): string {
  return new Date(localIso).toISOString()
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Лейбл дня для карусели: «Пт / 24 апр». Используется в калькуляторе. */
export function dayShortLabel(day: StationScheduleDay): { weekday: string; date: string } {
  const [y, m, d] = day.date.split('-').map((s) => Number(s))
  const dt = new Date(y, m - 1, d)
  const weekday = dt.toLocaleDateString('ru-RU', { weekday: 'short' }).toUpperCase()
  const date = dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return { weekday, date }
}
