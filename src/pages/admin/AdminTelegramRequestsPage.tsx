/**
 * Список Telegram VIN-заявок (по list.html).
 *
 * ⚠️ Данные пока статические (бэк-API не задеплоен). Сверху стат-карточки =
 * быстрые фильтры + доп. чипы (Без госномера / Авто не найдено) + поиск.
 * Колонки: ID / Дата / Фото / Госномер / VIN / Найденный авто / Telegram /
 * Статус / Действие.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTelegramRequestsQuery } from '@/features/admin-telegram/queries'
import { TELEGRAM_STATUS_META } from '@/features/admin-telegram/types'
import type { TelegramRequest } from '@/features/admin-telegram/types'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'
import { cn } from '@/shared/lib/cn'
import { formatDateTime } from '@/shared/lib/format'

type Bucket = 'all' | 'new' | 'no_vin' | 'no_plate' | 'not_found' | 'done' | 'problem'

function vinAssigned(r: TelegramRequest): boolean {
  return Boolean(r.found_car?.vin)
}
function matchBucket(r: TelegramRequest, b: Bucket): boolean {
  switch (b) {
    case 'new':
      return r.status === 'new'
    case 'no_vin':
      return !vinAssigned(r) && r.status !== 'done' && r.status !== 'problem'
    case 'no_plate':
      return !r.entered_plate
    case 'not_found':
      return !r.found_car && r.status !== 'new'
    case 'done':
      return r.status === 'done'
    case 'problem':
      return r.status === 'problem'
    default:
      return true
  }
}

export default function AdminTelegramRequestsPage() {
  const { data, isLoading, isError, refetch } = useTelegramRequestsQuery()
  const [bucket, setBucket] = useState<Bucket>('all')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => data ?? [], [data])

  const stats = useMemo(
    () => ({
      total: rows.length,
      new: rows.filter((r) => r.status === 'new').length,
      no_vin: rows.filter((r) => matchBucket(r, 'no_vin')).length,
      done: rows.filter((r) => r.status === 'done').length,
      problem: rows.filter((r) => r.status === 'problem').length,
    }),
    [rows],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      if (!matchBucket(r, bucket)) return false
      if (q) {
        const hay = [r.id, r.entered_plate, r.entered_vin, r.found_car?.title, r.telegram_username]
          .map((v) => String(v ?? '').toLowerCase())
          .join(' ')
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, bucket, search])

  return (
    <section className="space-y-6">
      <header>
        <p className="text-[11px] font-900 uppercase tracking-[0.22em] text-brandBlue">Telegram VIN</p>
        <h1 className="mt-1 text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
          VIN-заявки из Telegram
        </h1>
        <p className="mt-2 text-sm font-medium text-textSecondary">
          Касса присылает фото госномера и VIN — менеджер находит авто и присваивает VIN.
        </p>
      </header>

      {/* Стат-карточки = фильтры */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Всего" value={stats.total} active={bucket === 'all'} onClick={() => setBucket('all')} tone="text-textPrimary" />
        <StatCard label="Новые" value={stats.new} active={bucket === 'new'} onClick={() => setBucket('new')} tone="text-brandBlue" />
        <StatCard label="Без VIN" value={stats.no_vin} active={bucket === 'no_vin'} onClick={() => setBucket('no_vin')} tone="text-amber-700" />
        <StatCard label="Готово" value={stats.done} active={bucket === 'done'} onClick={() => setBucket('done')} tone="text-green-700" />
        <StatCard label="Проблемные" value={stats.problem} active={bucket === 'problem'} onClick={() => setBucket('problem')} tone="text-rose-700" />
      </div>

      <Card className="p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Chip active={bucket === 'no_plate'} onClick={() => setBucket('no_plate')}>Без госномера</Chip>
            <Chip active={bucket === 'not_found'} onClick={() => setBucket('not_found')}>Авто не найдено</Chip>
            {bucket !== 'all' && (
              <Chip active={false} onClick={() => setBucket('all')}>× Сбросить</Chip>
            )}
          </div>
          <div className="md:w-80">
            <Input
              label="Поиск"
              placeholder="ID, госномер, VIN, авто, @username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-sm font-bold text-red-700">Не удалось загрузить заявки.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-sct border border-borderLight bg-white px-4 py-2 text-xs font-900 uppercase tracking-widest text-textSecondary hover:border-brandBlue hover:text-brandBlue"
            >
              Повторить
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-textSecondary">
            По выбранным фильтрам заявок нет.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surfaceLight text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Дата</th>
                    <th className="px-5 py-3">Фото</th>
                    <th className="px-5 py-3">Госномер</th>
                    <th className="px-5 py-3">VIN</th>
                    <th className="px-5 py-3">Найденный автомобиль</th>
                    <th className="px-5 py-3">Telegram</th>
                    <th className="px-5 py-3 text-center">Статус</th>
                    <th className="px-5 py-3 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight">
                  {filtered.map((r) => (
                    <Row key={r.id} r={r} />
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="divide-y divide-borderLight lg:hidden">
              {filtered.map((r) => (
                <CardMobile key={r.id} r={r} />
              ))}
            </ul>
          </>
        )}
      </Card>
    </section>
  )
}

function StatCard({ label, value, active, onClick, tone }: { label: string; value: number; active: boolean; onClick: () => void; tone: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-sct border bg-white p-4 text-left transition-all',
        active ? 'border-brandBlue shadow-soft-blue' : 'border-borderLight hover:border-brandBlue/40',
      )}
    >
      <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">{label}</p>
      <p className={cn('mt-1 text-2xl font-900 tracking-tight', tone)}>{value}</p>
    </button>
  )
}

function Chip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2 text-[11px] font-900 uppercase tracking-widest transition-colors',
        active ? 'border-brandBlue bg-blue-50 text-brandBlue' : 'border-borderLight bg-white text-textSecondary hover:border-brandBlue/40',
      )}
    >
      {children}
    </button>
  )
}

function StatusPill({ status }: { status: string }) {
  const meta = TELEGRAM_STATUS_META[status]
  return (
    <span className={cn('inline-block rounded-md px-2.5 py-1 text-[10px] font-900 uppercase tracking-widest', meta?.tone ?? 'bg-surfaceMuted text-textSecondary')}>
      {meta?.label ?? status}
    </span>
  )
}

function PhotoDots() {
  // Фото из Telegram (URL пока нет) — показываем индикатор наличия.
  return (
    <div className="flex gap-1.5">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surfaceMuted text-textSecondary" title="Фото госномера">
        <CamIcon />
      </span>
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surfaceMuted text-textSecondary" title="Фото VIN">
        <CamIcon />
      </span>
    </div>
  )
}

function CamIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h1l1.5-2h9L17 7h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <circle cx="12" cy="13" r="3" strokeWidth={1.8} />
    </svg>
  )
}

function Row({ r }: { r: TelegramRequest }) {
  return (
    <tr className="hover:bg-surfaceLight/50">
      <td className="px-5 py-4 font-900 text-textPrimary">#{r.id}</td>
      <td className="px-5 py-4 text-textSecondary">{formatDateTime(r.created_at)}</td>
      <td className="px-5 py-4"><PhotoDots /></td>
      <td className="px-5 py-4">
        {r.entered_plate ? (
          <span className="rounded bg-surfaceMuted px-2 py-0.5 font-mono text-[11px] font-bold uppercase text-textPrimary">{r.entered_plate}</span>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">нет</span>
        )}
      </td>
      <td className="px-5 py-4">
        {vinAssigned(r) ? (
          <span className="font-mono text-[11px] text-textPrimary">{r.found_car?.vin}</span>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">не присвоен</span>
        )}
      </td>
      <td className="px-5 py-4">{r.found_car ? <span className="font-bold text-textPrimary">{r.found_car.title}</span> : <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600">не найдено</span>}</td>
      <td className="px-5 py-4 font-mono text-[12px] text-textSecondary">{r.telegram_username}</td>
      <td className="px-5 py-4 text-center"><StatusPill status={r.status} /></td>
      <td className="px-5 py-4 text-right">
        <Link to={`/admin/telegram/${r.id}`} className="inline-block rounded-md bg-brandBlue px-3 py-1.5 text-[10px] font-900 uppercase tracking-widest text-white hover:bg-brandBlueDark">
          Открыть
        </Link>
      </td>
    </tr>
  )
}

function CardMobile({ r }: { r: TelegramRequest }) {
  return (
    <li>
      <Link to={`/admin/telegram/${r.id}`} className="block p-4 transition-colors hover:bg-surfaceLight/60">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-900 text-textPrimary">#{r.id}</p>
            <p className="mt-0.5 text-[12px] font-bold text-textSecondary">{formatDateTime(r.created_at)}</p>
          </div>
          <StatusPill status={r.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-mono font-bold text-textPrimary">{r.entered_plate || 'без госномера'}</span>
          <span className="text-textSecondary/50">·</span>
          <span className="text-textSecondary">{r.found_car?.title ?? 'авто не найдено'}</span>
        </div>
      </Link>
    </li>
  )
}
