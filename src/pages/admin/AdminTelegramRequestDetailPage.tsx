/**
 * Детальная Telegram VIN-заявки (по detail_full.html).
 *
 * ⚠️ СТАТИКА: бэк-API не подключён. Действия (Сохранить / Найти авто /
 * Присвоить VIN / Изменить статус / Отметить проблему) обновляют ЛОКАЛЬНЫЙ
 * стейт + показывают тост. Когда появится реальный API — заменить хендлеры
 * на мутации (PATCH/POST к /staff_endpoints/telegram_vehicle_requests/{id}/…).
 */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTelegramRequestQuery } from '@/features/admin-telegram/queries'
import {
  TELEGRAM_STATUS_META,
  TELEGRAM_STATUS_ORDER,
} from '@/features/admin-telegram/types'
import type { TelegramEvent, TelegramFoundCar } from '@/features/admin-telegram/types'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { Spinner } from '@/shared/ui/Spinner'
import { toast } from '@/shared/ui/Toast'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

const STUB = 'Сохранено локально — бэк-API ещё не подключён.'

export default function AdminTelegramRequestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()
  const { data, isLoading, isError } = useTelegramRequestQuery(id)

  const [plate, setPlate] = useState('')
  const [vin, setVin] = useState('')
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('')
  const [foundCar, setFoundCar] = useState<TelegramFoundCar | null>(null)
  const [events, setEvents] = useState<TelegramEvent[]>([])
  const initedRef = useRef<number | null>(null)

  useEffect(() => {
    if (data && initedRef.current !== data.id) {
      setPlate(data.entered_plate)
      setVin(data.entered_vin || data.found_car?.vin || '')
      setComment(data.staff_comment)
      setStatus(data.status)
      setFoundCar(data.found_car)
      setEvents(data.events)
      initedRef.current = data.id
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data || !id) {
    return (
      <section>
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Заявка не найдена.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/admin/telegram')}>
            ← К заявкам
          </Button>
        </Card>
      </section>
    )
  }

  const meta = TELEGRAM_STATUS_META[status]
  const addEvent = (title: string, text?: string) =>
    setEvents((prev) => [{ at: new Date().toISOString(), title, text }, ...prev])

  const saveData = () => {
    addEvent('Данные обновлены', plate ? `Госномер: ${plate}` : undefined)
    toast.info(STUB)
  }
  const findCar = () => {
    if (!plate.trim()) {
      toast.error('Сначала введите госномер')
      return
    }
    const car: TelegramFoundCar = data.found_car ?? {
      id: 0,
      title: `Авто по ${plate.trim()}`,
      plate: plate.trim(),
      vin: null,
    }
    setFoundCar(car)
    setStatus('car_found')
    addEvent('Автомобиль найден', car.title)
    toast.info(`Найдено локально. ${STUB}`)
  }
  const assignVin = () => {
    if (!foundCar) {
      toast.error('Сначала найдите автомобиль')
      return
    }
    if (!vin.trim()) {
      toast.error('Введите VIN')
      return
    }
    setFoundCar({ ...foundCar, vin: vin.trim() })
    setStatus('done')
    addEvent('VIN присвоен автомобилю', vin.trim())
    toast.info(`Присвоено локально. ${STUB}`)
  }
  const changeStatus = (next: string) => {
    setStatus(next)
    addEvent('Статус изменён', TELEGRAM_STATUS_META[next]?.label ?? next)
    toast.info(STUB)
  }
  const markProblem = () => {
    setStatus('problem')
    addEvent('Отмечена проблема', comment.trim() || undefined)
    toast.info(STUB)
  }

  return (
    <section className="space-y-6">
      <Link
        to="/admin/telegram"
        className="inline-flex items-center gap-2 text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
      >
        ← Назад к Telegram-заявкам
      </Link>

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-900 uppercase tracking-[0.22em] text-brandBlue">
            Telegram Vehicle Request
          </p>
          <h1 className="mt-1 text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-4xl">
            Telegram-заявка #{data.id}
          </h1>
          <p className="mt-2 text-sm font-medium text-textSecondary">
            Создана {formatDateTime(data.created_at)} • источник: Telegram-бот
          </p>
        </div>
        <span className={cn('inline-block self-start rounded-md px-3 py-1.5 text-[11px] font-900 uppercase tracking-widest', meta?.tone ?? 'bg-surfaceMuted text-textSecondary')}>
          {meta?.label ?? status}
        </span>
      </header>

      {/* Индикатор статики */}
      <div className="rounded-sct border border-amber-200 bg-amber-50 p-3 text-[12px] font-medium text-amber-800">
        Демо-режим: данные статические, действия сохраняются только локально — бэк-API
        Telegram-заявок ещё не подключён.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Контент */}
        <div className="space-y-4 lg:col-span-8">
          {/* Фото */}
          <Card className="p-5 md:p-6">
            <SectionTitle>Фото из Telegram</SectionTitle>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PhotoBox label="Фото госномера" />
              <PhotoBox label="Фото VIN-кода" />
            </div>
          </Card>

          {/* Найденный автомобиль */}
          <Card className="p-5 md:p-6">
            <SectionTitle>Найденный автомобиль</SectionTitle>
            {foundCar ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-900 uppercase tracking-tight text-textPrimary">{foundCar.title}</h3>
                  {foundCar.vin ? (
                    <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-900 uppercase tracking-widest text-green-700">VIN присвоен</span>
                  ) : (
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-900 uppercase tracking-widest text-orange-700">VIN ещё не присвоен</span>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MiniRow label="Госномер" value={foundCar.plate} mono />
                  <MiniRow label="VIN" value={foundCar.vin || '—'} mono />
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-sct border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                Автомобиль не найден. Введите госномер и нажмите «Найти авто по госномеру».
              </p>
            )}
          </Card>

          {/* История */}
          <Card className="p-5 md:p-6">
            <SectionTitle>История обработки</SectionTitle>
            <ol className="mt-4 space-y-4">
              {events.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brandBlue" />
                  <div className="min-w-0">
                    <p className="text-sm font-900 uppercase tracking-tight text-textPrimary">{e.title}</p>
                    {e.text && <p className="mt-0.5 text-[13px] text-textSecondary">{e.text}</p>}
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-textSecondary/60">
                      {formatDateTime(e.at)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* Сайдбар */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            {/* Обработка заявки */}
            <Card className="p-5 md:p-6">
              <SectionTitle>Обработка заявки</SectionTitle>
              <div className="mt-3 space-y-3">
                <Input label="Госномер" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} placeholder="847ATB02" />
                <Input label="VIN-код" value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="JTDBR32E720000000" />
                <Textarea label="Комментарий сотрудника" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
              </div>
              <div className="mt-4 space-y-2">
                <Button variant="primary" fullWidth onClick={saveData}>Сохранить данные</Button>
                <Button variant="secondary" fullWidth onClick={findCar}>Найти авто по госномеру</Button>
                <Button variant="primary" fullWidth onClick={assignVin}>Присвоить VIN автомобилю</Button>
              </div>
            </Card>

            {/* Источник */}
            <Card className="p-5 md:p-6">
              <SectionTitle>Источник заявки</SectionTitle>
              <div className="mt-3 space-y-3">
                <MiniRow label="Telegram username" value={data.telegram_username} mono />
                <MiniRow label="Telegram User ID" value={data.telegram_user_id} mono />
                <MiniRow label="Chat ID" value={data.telegram_chat_id} mono />
              </div>
            </Card>

            {/* Панель действий */}
            <Card className="p-5 md:p-6">
              <SectionTitle>Панель действий</SectionTitle>
              <div className="mt-3 space-y-3">
                <Select label="Статус" value={status} onChange={(e) => changeStatus(e.target.value)}>
                  {TELEGRAM_STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {TELEGRAM_STATUS_META[s]?.label ?? s}
                    </option>
                  ))}
                </Select>
                <Button variant="danger" fullWidth onClick={markProblem} disabled={status === 'problem'}>
                  Отметить проблему
                </Button>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">{children}</p>
}

function MiniRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-sct border border-borderLight bg-surfaceLight p-3">
      <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">{label}</p>
      <p className={cn('mt-1 text-sm font-bold text-textPrimary', mono && 'font-mono text-[13px]')}>{value}</p>
    </div>
  )
}

function PhotoBox({ label }: { label: string }) {
  return (
    <div className="overflow-hidden rounded-sct border border-borderLight">
      <div className="border-b border-borderLight bg-surfaceLight px-4 py-2">
        <p className="text-[11px] font-900 uppercase tracking-widest text-textPrimary">{label}</p>
      </div>
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-surfaceLight to-surfaceMuted">
        <div className="text-center text-textSecondary/60">
          <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h1l1.5-2h9L17 7h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
          </svg>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest">Фото из Telegram</p>
        </div>
      </div>
    </div>
  )
}
