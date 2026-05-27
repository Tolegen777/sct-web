/**
 * Шаг «Дата и время».
 *
 * Сверху — горизонтальная лента дней из расписания выбранного филиала
 * (на 14 дней вперёд). Выходные/закрытые — disabled. Активный день
 * подсвечен синим.
 *
 * Под ней — слоты с разделением «Утро / День / Вечер» (как в HTML-мокапе
 * booking_workflow_v1). Для сегодняшнего дня прошедшие слоты заблокированы.
 *
 * Когда бэк подключит /slots/ с пометками `booked` — заменим встроенный
 * генератор слотов на запрос к API.
 */
import { useMemo } from 'react'
import { useServiceStationQuery } from '@/features/service-stations/queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'
import {
  buildTimeSlots,
  dayShortLabel,
  groupSlotsByPeriod,
  type TimeSlot,
} from './lib'
import type { StationScheduleDay } from '@/features/service-stations/types'

interface DateTimeStepProps {
  branchId: number
  selectedDate: string | null
  selectedSlot: string | null
  onChange: (date: string | null, slot: string | null) => void
}

export function DateTimeStep({
  branchId,
  selectedDate,
  selectedSlot,
  onChange,
}: DateTimeStepProps) {
  const { data, isLoading, isError } = useServiceStationQuery(branchId, 14)

  // Минимальное допустимое время для is_today — сейчас + 30 минут.
  const firstAllowed = useMemo(() => new Date(Date.now() + 30 * 60_000), [])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="rounded-sct border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
        Не удалось загрузить расписание филиала.
      </p>
    )
  }

  const selectedDay = data.schedule.find((d) => d.date === selectedDate) ?? null
  const slots = selectedDay
    ? buildTimeSlots(selectedDay, selectedDay.is_today ? firstAllowed : undefined)
    : []
  const { morning, day, evening } = groupSlotsByPeriod(slots)

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
          Выберите дату и время
        </h2>
        <p className="mt-1 text-sm font-medium text-textSecondary">
          В <span className="font-bold text-textPrimary">{data.name}</span>.
          Слоты по 30 минут.
        </p>
      </div>

      {/* Дни */}
      <div>
        <h3 className="mb-3 text-[11px] font-900 uppercase tracking-widest text-textSecondary">
          Дата визита
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {data.schedule.map((d) => (
            <DayChip
              key={d.date}
              day={d}
              isSelected={d.date === selectedDate}
              onSelect={() => onChange(d.date, null)}
            />
          ))}
        </div>
      </div>

      {/* Слоты */}
      {selectedDay ? (
        <div className="space-y-5">
          {slots.length === 0 ? (
            <Card className="p-4 text-center">
              <p className="text-sm font-bold text-textSecondary">
                {selectedDay.is_closed
                  ? 'В этот день филиал закрыт.'
                  : 'На этот день нет доступных слотов.'}
              </p>
            </Card>
          ) : (
            <>
              <SlotGroup
                title="Утро"
                hint="до 12:00"
                slots={morning}
                selected={selectedSlot}
                onSelect={(slot) => onChange(selectedDate, slot)}
              />
              <SlotGroup
                title="День"
                hint="12:00 – 18:00"
                slots={day}
                selected={selectedSlot}
                onSelect={(slot) => onChange(selectedDate, slot)}
              />
              <SlotGroup
                title="Вечер"
                hint="после 18:00"
                slots={evening}
                selected={selectedSlot}
                onSelect={(slot) => onChange(selectedDate, slot)}
              />
            </>
          )}
        </div>
      ) : (
        <p className="text-sm font-medium italic text-textSecondary">
          Выберите день — мы покажем доступные слоты.
        </p>
      )}
    </div>
  )
}

function DayChip({
  day,
  isSelected,
  onSelect,
}: {
  day: StationScheduleDay
  isSelected: boolean
  onSelect: () => void
}) {
  const { weekday, date } = dayShortLabel(day)
  const disabled = day.is_closed || !day.available
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'flex min-w-[88px] shrink-0 flex-col items-center rounded-sct border px-3 py-3 text-center transition-all',
        disabled
          ? 'cursor-not-allowed border-borderLight bg-surfaceLight/40 opacity-40'
          : isSelected
          ? 'border-brandBlue bg-brandBlue text-white shadow-soft-blue'
          : 'border-borderLight bg-white hover:border-brandBlue/40',
      )}
    >
      <span
        className={cn(
          'text-[10px] font-900 uppercase tracking-widest',
          isSelected ? 'text-white/80' : 'text-textSecondary',
        )}
      >
        {weekday}
      </span>
      <span
        className={cn(
          'mt-1 text-lg font-900 italic leading-none tracking-tighter',
          isSelected ? 'text-white' : 'text-textPrimary',
        )}
      >
        {date}
      </span>
      {disabled && (
        <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-textSecondary">
          Выходной
        </span>
      )}
    </button>
  )
}

function SlotGroup({
  title,
  hint,
  slots,
  selected,
  onSelect,
}: {
  title: string
  hint: string
  slots: TimeSlot[]
  selected: string | null
  onSelect: (slot: string) => void
}) {
  if (slots.length === 0) return null
  return (
    <div>
      <p className="mb-2 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
        {title} <span className="text-textSecondary/50">· {hint}</span>
      </p>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3 lg:grid-cols-6">
        {slots.map((slot) => {
          const isSelected = selected === slot.localIso
          return (
            <button
              key={slot.localIso}
              type="button"
              disabled={slot.inPast}
              onClick={() => onSelect(slot.localIso)}
              className={cn(
                'rounded-sct border px-3 py-3 text-sm font-900 italic tracking-tighter transition-all',
                slot.inPast
                  ? 'cursor-not-allowed border-borderLight bg-surfaceLight/40 text-textSecondary/30 line-through'
                  : isSelected
                  ? 'border-brandBlue bg-brandBlue text-white shadow-soft-blue'
                  : 'border-borderLight bg-white text-textPrimary hover:border-brandBlue/40',
              )}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
