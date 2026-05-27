/**
 * Админка → раздел «Автомобили».
 *
 * Список уникальных модификаций авто из клиентского парка. Каждая строка —
 * это `ClientCar.modification`, агрегированная по `modification_source_id`.
 * Колонки: ID, авто (марка + модель), тех. данные (топливо/трансмиссия/мощность),
 * клиенты с этим авто, привязанные пакеты.
 *
 * Источник: GET /staff_endpoints/cars/cars-list-page-data/.
 * Фильтры в URL, чтобы можно было поделиться ссылкой на выборку.
 */
import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdminCarsList } from '@/features/admin-cars/queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { cn } from '@/shared/lib/cn'
import type {
  AdminCarsListQuery,
  AdminCarsStat,
  CarRow,
} from '@/features/admin-cars/types'

const ALLOWED_PAGE_SIZES = [10, 20, 50, 100] as const
type PageSize = (typeof ALLOWED_PAGE_SIZES)[number]

function parsePageSize(v: string | null): PageSize {
  const n = Number(v)
  return (ALLOWED_PAGE_SIZES as readonly number[]).includes(n) ? (n as PageSize) : 20
}

export default function AdminCarsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const query: AdminCarsListQuery = useMemo(
    () => ({
      search: searchParams.get('search') ?? undefined,
      mark: numberOrUndefined(searchParams.get('mark')),
      model: numberOrUndefined(searchParams.get('model')),
      year: numberOrUndefined(searchParams.get('year')),
      ordering: searchParams.get('ordering') ?? '-clients_count',
      page: Number(searchParams.get('page')) || 1,
      page_size: parsePageSize(searchParams.get('page_size')),
    }),
    [searchParams],
  )

  const { data, isLoading, isFetching, isError, refetch } = useAdminCarsList(query)

  const update = (patch: Record<string, string | null | undefined>) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k)
      else next.set(k, v)
    })
    if (!('page' in patch)) next.delete('page')
    setSearchParams(next)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <section className="container-admin py-10">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Не удалось загрузить список авто.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
            Повторить
          </Button>
        </Card>
      </section>
    )
  }

  return (
    <section className="container-admin space-y-6 py-8 md:space-y-8 md:py-10">
      <header>
        <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
          Staff / Автомобили
        </p>
        <h1 className="mt-2 text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:text-4xl">
          {data.page.title}
        </h1>
        <p className="mt-1 text-sm font-medium italic text-textSecondary">
          {data.page.subtitle}
        </p>
      </header>

      <StatsRow stats={[
        { item: data.stats.client_cars_total, accent: 'border-l-brandBlue' },
        { item: data.stats.unique_modifications_total, accent: 'border-l-green-500' },
        { item: data.stats.covered_modifications_total, accent: 'border-l-brandYellow' },
      ]} />

      <Card className="p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-4">
            <Input
              label="Поиск"
              placeholder="Toyota, Camry, AUDI..."
              value={searchParams.get('search') ?? ''}
              onChange={(e) => update({ search: e.target.value || null })}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              label="Марка"
              value={searchParams.get('mark') ?? ''}
              onChange={(e) => update({ mark: e.target.value || null, model: null })}
            >
              <option value="">Все марки</option>
              {data.filters.marks.map((m) => (
                <option key={m.value} value={String(m.value)}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select
              label="Сортировка"
              value={searchParams.get('ordering') ?? '-clients_count'}
              onChange={(e) => update({ ordering: e.target.value })}
            >
              <option value="-clients_count">По клиентам ↓</option>
              <option value="clients_count">По клиентам ↑</option>
              <option value="-packages_count">По пакетам ↓</option>
              <option value="-modification_id">Новые → старые</option>
              <option value="modification_id">Старые → новые</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Select
              label="На странице"
              value={String(query.page_size)}
              onChange={(e) => update({ page_size: e.target.value, page: '1' })}
            >
              {ALLOWED_PAGE_SIZES.map((s) => (
                <option key={s} value={String(s)}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <ResultsTable items={data.results} loading={isFetching && !isLoading} />
      </Card>

      <Pagination
        page={data.pagination.page}
        total={data.pagination.total}
        totalPages={data.pagination.pages}
        pageSize={data.pagination.page_size}
        onChange={(p) => update({ page: String(p) })}
      />
    </section>
  )
}

function StatsRow({
  stats,
}: {
  stats: { item: AdminCarsStat; accent: string }[]
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5">
      {stats.map(({ item, accent }) => (
        <div
          key={item.label}
          className={`rounded-sct border border-borderLight bg-white p-4 shadow-sct-soft border-l-4 ${accent}`}
        >
          <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            {item.label}
          </p>
          <p className="mt-1.5 text-3xl font-900 italic tracking-tighter text-textPrimary">
            {item.value.toLocaleString('ru-RU')}
          </p>
          {item.description && (
            <p className="mt-1 text-[11px] font-medium italic text-textSecondary/70">
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function ResultsTable({ items, loading }: { items: CarRow[]; loading: boolean }) {
  if (items.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-base font-bold text-textSecondary">
          Под выбранные фильтры авто не найдено.
        </p>
      </div>
    )
  }
  return (
    <div className={cn('overflow-x-auto transition-opacity', loading && 'opacity-60')}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-borderLight bg-surfaceLight text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            <th className="px-6 py-4 text-left w-32">ID</th>
            <th className="px-6 py-4 text-left">Автомобиль</th>
            <th className="px-6 py-4 text-left">Технические данные</th>
            <th className="px-6 py-4 text-center w-24">Клиенты</th>
            <th className="px-6 py-4 text-center w-32">Пакеты</th>
            <th className="px-6 py-4 w-12" />
          </tr>
        </thead>
        <tbody className="divide-y divide-borderLight">
          {items.map((row) => (
            <tr
              key={row.id}
              className="cursor-pointer transition-colors hover:bg-surfaceLight/60"
            >
              <td className="px-6 py-4 font-mono text-[10px] font-bold text-textSecondary">
                #{row.modification_id}
              </td>
              <td className="px-6 py-4">
                <div className="font-900 uppercase italic tracking-tighter text-textPrimary">
                  {row.car.mark.name} {row.car.model.name}
                </div>
                <div className="mt-0.5 text-[11px] font-bold uppercase tracking-tighter text-textSecondary">
                  {row.car.generation?.display_name && `${row.car.generation.display_name} · `}
                  {row.car.configuration?.name && `${row.car.configuration.name} · `}
                  {row.car.modification.name}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  {row.technical.engine?.label && (
                    <Chip color="blue">{row.technical.engine.label}</Chip>
                  )}
                  {row.technical.transmission?.label && (
                    <Chip>{row.technical.transmission.label}</Chip>
                  )}
                  {row.technical.drive?.label && <Chip>{row.technical.drive.label}</Chip>}
                  {row.technical.power?.label && <Chip>{row.technical.power.label}</Chip>}
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg border border-borderLight bg-surfaceLight px-2 font-900 text-xs">
                  {row.clients_count}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {row.has_packages ? (
                  <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-[10px] font-900 uppercase tracking-widest text-green-700">
                    {row.packages_count} пакет.
                  </span>
                ) : (
                  <span className="text-[10px] font-800 italic uppercase tracking-widest text-textSecondary/40">
                    Без услуг
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  to={`/admin/cars/${encodeURIComponent(row.id)}`}
                  className="text-[11px] font-bold uppercase tracking-widest text-brandBlue hover:underline"
                >
                  →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Chip({
  children,
  color = 'gray',
}: {
  children: React.ReactNode
  color?: 'blue' | 'gray'
}) {
  return (
    <span
      className={cn(
        'inline-block rounded border px-2.5 py-1 text-[10px] font-900 uppercase tracking-tighter',
        color === 'blue'
          ? 'border-blue-100 bg-blue-50 text-brandBlue'
          : 'border-borderLight bg-surfaceLight text-textPrimary',
      )}
    >
      {children}
    </span>
  )
}

function Pagination({
  page,
  total,
  totalPages,
  pageSize,
  onChange,
}: {
  page: number
  total: number
  totalPages: number
  pageSize: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) {
    return (
      <p className="text-center text-[11px] font-bold uppercase tracking-widest text-textSecondary">
        Всего: {total.toLocaleString('ru-RU')}
      </p>
    )
  }
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  return (
    <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
      <p className="text-[11px] font-bold uppercase tracking-widest text-textSecondary">
        Показано {start}–{end} из {total.toLocaleString('ru-RU')}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ← Назад
        </Button>
        <span className="text-xs font-bold uppercase tracking-widest text-textSecondary">
          Стр. {page} из {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Вперёд →
        </Button>
      </div>
    </div>
  )
}

function numberOrUndefined(v: string | null): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}
