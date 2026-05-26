/**
 * Промо-баннер на главной (вариант под обновлённый дизайн).
 *
 * Структура: синий блок, слева текст + кнопки, справа — тёмная плашка с
 * countdown (DD HH MM). Дата окончания — конец текущего месяца, потом
 * заменим на end_date сущности Promo.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const PROMO_END_ISO = endOfCurrentMonthISO()

export function HomePromoBanner() {
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
    <section className="relative overflow-hidden rounded-sct-lg bg-gradient-to-br from-brandBlue via-brandBlue to-brandBlueDark text-white">
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative z-10 grid grid-cols-1 gap-5 p-6 md:grid-cols-12 md:gap-6 md:p-8">
        {/* Левая часть с текстом и кнопками */}
        <div className="md:col-span-8">
          <span className="inline-block rounded-md bg-brandYellow px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest text-textPrimary">
            Акция месяца
          </span>
          <h2 className="mt-3 text-2xl font-900 uppercase italic leading-[1.05] tracking-tight md:text-3xl lg:text-4xl">
            −20% НА ЗАМЕНУ МАСЛА<br />И ФИЛЬТРОВ
          </h2>
          <p className="mt-3 max-w-xl text-sm font-medium opacity-80 md:text-base">
            Для большинства авто доступен специальный пакет: масло, фильтр,
            диагностика и работа мастера.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/services"
              className="rounded-sct bg-white px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-brandBlue shadow-md transition-all hover:bg-brandYellow hover:text-textPrimary"
            >
              Забронировать акцию
            </Link>
            <Link
              to="/services"
              className="rounded-sct border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white backdrop-blur transition-all hover:bg-white/10"
            >
              Все акции
            </Link>
          </div>
        </div>

        {/* Правая плашка с countdown */}
        <div className="md:col-span-4">
          <div className="rounded-sct-lg border border-white/10 bg-navy/60 p-4 backdrop-blur md:p-5">
            <p className="mb-3 text-center text-[10px] font-900 uppercase tracking-widest text-white/60">
              До конца акции
            </p>
            <div className="flex items-end justify-around gap-2">
              <CountUnit value={days} label="дн" />
              <CountSep />
              <CountUnit value={hours} label="час" />
              <CountSep />
              <CountUnit value={minutes} label="мин" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-900 italic leading-none tracking-tighter text-white md:text-4xl">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/50">
        {label}
      </p>
    </div>
  )
}

function CountSep() {
  return <span className="text-2xl font-900 italic text-white/30 md:text-3xl">:</span>
}

function endOfCurrentMonthISO(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0).toISOString()
}
