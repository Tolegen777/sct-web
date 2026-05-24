/**
 * Промо-баннер «-20% на замену масла» с обратным отсчётом до конца акции.
 *
 * Дата окончания акции — пока статичная (конец текущего месяца) ровно как в
 * дизайн-мокапе. Когда бэк добавит сущность Promo с end_date, заберём оттуда.
 * Если до конца акции <0 секунд — баннер не показываем.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button'

const PROMO_END_ISO = endOfCurrentMonthISO()

export function PromoBanner() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diffMs = useMemo(() => new Date(PROMO_END_ISO).getTime() - now, [now])
  if (diffMs <= 0) return null

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return (
    <section className="relative overflow-hidden rounded-sct-xl bg-textPrimary p-6 text-white shadow-2xl md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brandBlue/30 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-block rounded-md bg-brandYellow px-3 py-1 text-[10px] font-900 uppercase tracking-widest text-textPrimary">
            Акция месяца
          </span>
          <h2 className="mt-4 text-3xl font-900 uppercase italic leading-none tracking-tight md:text-4xl lg:text-5xl">
            −20% на замену масла<br />и фильтров
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium opacity-80 md:text-base">
            Для большинства авто доступен специальный пакет: масло, фильтр,
            диагностика и работа мастера.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/services">
              <Button variant="primary" size="md">
                Забронировать акцию
              </Button>
            </Link>
            <Link to="/services">
              <Button
                variant="ghost"
                size="md"
                className="!text-white hover:!bg-white/10"
              >
                Все акции
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative z-10 rounded-sct-lg border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
          <p className="mb-3 text-[10px] font-900 uppercase tracking-widest text-white/60">
            До конца акции
          </p>
          <div className="flex items-end gap-4">
            <CountUnit value={days} label="дн" />
            <span className="text-3xl font-900 italic text-white/40">:</span>
            <CountUnit value={hours} label="час" />
            <span className="text-3xl font-900 italic text-white/40">:</span>
            <CountUnit value={minutes} label="мин" />
          </div>
        </div>
      </div>
    </section>
  )
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-900 italic leading-none tracking-tighter text-white md:text-5xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
        {label}
      </p>
    </div>
  )
}

function endOfCurrentMonthISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0).toISOString()
}
