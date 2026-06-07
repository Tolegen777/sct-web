/**
 * Детальная страница точного пакета услуги.
 *
 * Вёрстка по свежему макету (Figma img_20) — единое семейство с
 * DefaultServiceDetailPage: хлебные крошки → hero-карточка (градиент-бар,
 * пиллы, заголовок, описание, 3 мини-карточки) → промо → состав пакета →
 * описание; справа липкий сайдбар (фото, цена/экономия, CTA, спек-таблица).
 *
 * Ограничения API:
 *  - ClientPackageItem не отдаёт цену по позициям (только количество) —
 *    показываем количество и тип, итог = final_price.
 *  - Номера пакета (PKG-…) в API нет — в спек-таблице показываем #id.
 *
 * Прим.: italic в проекте убран глобально — не используем.
 */
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePackageQuery } from '@/features/packages/queries'
import { useAuthStore } from '@/features/auth/store'
import { GuestPrompt } from '@/features/auth/GuestPrompt'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { formatMoney } from '@/shared/lib/format'
import { getPackageShortTitle } from '@/features/packages/lib'

export default function PackageDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : undefined
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  const { data, isLoading, isError, refetch } = usePackageQuery(id)

  if (!isAuthed) {
    return (
      <GuestPrompt
        title="Услуга доступна после регистрации"
        description="Чтобы увидеть состав пакета, цену и записаться на сервис, зарегистрируйтесь или войдите."
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
          <p className="font-bold text-red-700">Пакет не найден или недоступен.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Повторить
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
              К списку услуг
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  const shortTitle = getPackageShortTitle(data)
  const hasDiscount = data.discount_type !== 'NONE'
  const price = formatMoney(data.final_price, data.currency)
  const economy = Number(data.base_total) - Number(data.final_price)
  const showEconomy = hasDiscount && Number.isFinite(economy) && economy > 0
  const items = data.package_items ?? []
  const accent = data.category?.color || '#1F5FAF'
  const bookHref = `/services/${data.id}/book`

  return (
    <section className="container-sct py-6 md:py-8">
      {/* Хлебные крошки */}
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-900 uppercase tracking-widest text-textSecondary md:mb-6">
        <Link to="/services" className="transition-colors hover:text-brandBlue">
          Услуги
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-textPrimary">{shortTitle}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12 md:gap-8">
        {/* === Контент === */}
        <div className="space-y-6 xl:col-span-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-sct-lg border border-borderLight bg-white p-5 shadow-soft-card md:p-8">
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ background: `linear-gradient(90deg, ${accent}, #F2C94C)` }}
            />
            <div className="mb-5 flex flex-wrap items-center gap-2 md:gap-3">
              <Pill className="bg-blue-50 text-brandBlue">Пакет под ваш авто</Pill>
              {data.category?.name && (
                <Pill className="bg-green-50 text-green-700">{data.category.name}</Pill>
              )}
              {data.has_promotion && <Pill className="bg-orange-50 text-orange-700">Акция активна</Pill>}
            </div>

            <p className="mb-3 text-[11px] font-900 uppercase tracking-[0.18em] text-brandBlue">
              Пакет под ваш автомобиль
            </p>
            <h1 className="text-3xl font-900 uppercase leading-[0.98] tracking-tight text-textPrimary md:text-5xl">
              {shortTitle} <span className="text-brandBlue">{data.car_title}</span>
            </h1>

            {data.description && (
              <p className="mt-5 line-clamp-3 max-w-3xl text-base leading-relaxed text-textSecondary md:text-lg">
                {data.description}
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              <MiniCard label="Категория" value={data.category?.name || 'Сервис'} />
              <MiniCard label="Автомобиль" value={data.car_title} />
              <MiniCard label="Стоимость" value={price} accent />
            </div>
          </div>

          {/* Промо */}
          {data.has_promotion && (data.promotion_title || hasDiscount) && (
            <div className="rounded-sct-lg border border-l-4 border-borderLight border-l-brandYellow bg-brandYellow/10 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                    Спецпредложение
                  </p>
                  <h3 className="mt-2 text-base font-900 uppercase tracking-tight text-textPrimary md:text-lg">
                    {data.promotion_title || 'Скидка на пакет обслуживания'}
                  </h3>
                  {data.promotion_terms && (
                    <p className="mt-2 text-sm font-medium leading-relaxed text-textSecondary">
                      {data.promotion_terms}
                    </p>
                  )}
                </div>
                {hasDiscount && data.discount_type === 'PERCENT' && (
                  <span className="shrink-0 rounded-sct bg-brandYellow px-3 py-2 text-lg font-900 leading-none text-textPrimary">
                    −{Number(data.discount_percent)}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Состав пакета */}
          {items.length > 0 && (
            <div className="overflow-hidden rounded-sct-lg border border-borderLight bg-white shadow-soft-card">
              <header className="flex items-center justify-between border-b border-borderLight bg-surfaceLight px-5 py-4 md:px-6">
                <h2 className="text-[11px] font-900 uppercase tracking-widest text-textSecondary">
                  Состав пакета
                </h2>
                <span className="text-[11px] font-900 uppercase tracking-widest text-textSecondary">
                  {items.length} поз.
                </span>
              </header>
              <ul className="divide-y divide-borderLight">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 md:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-textPrimary">{item.item_name}</p>
                      <p className="mt-0.5 text-[10px] font-900 uppercase tracking-widest text-brandBlue">
                        {item.item_type === 'SERVICE' ? 'Работа' : 'Товар'}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-900 text-textPrimary">
                      {formatQty(item.quantity, item.item_type)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-borderLight bg-surfaceLight px-5 py-4 md:px-6">
                <span className="text-[11px] font-900 uppercase tracking-widest text-textSecondary">
                  Итого
                </span>
                <span className="text-lg font-900 tracking-tight text-brandBlue">{price}</span>
              </div>
            </div>
          )}

          {/* Описание */}
          {data.description && (
            <div className="rounded-sct-lg border border-borderLight bg-white p-5 shadow-soft-card md:p-7">
              <p className="mb-2 text-[11px] font-900 uppercase tracking-[0.18em] text-brandBlue">
                Описание
              </p>
              <h2 className="mb-4 text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
                Описание пакета
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-textPrimary md:text-base">
                {data.description}
              </p>
            </div>
          )}
        </div>

        {/* === Сайдбар === */}
        <aside className="space-y-6 xl:col-span-4">
          <div className="overflow-hidden rounded-sct-lg border border-borderLight bg-white shadow-soft-card xl:sticky xl:top-28">
            <div className="h-[200px] bg-surfaceLight md:h-[240px]">
              <SafeImage
                src={data.image_url || undefined}
                alt={shortTitle}
                className="h-full w-full object-cover"
                fallback={
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${accent}22, #F2C94C22)` }}
                  >
                    <PackageGlyph />
                  </div>
                }
              />
            </div>

            <div className="p-5 md:p-6">
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Стоимость пакета
              </p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-900 tracking-tight text-brandBlue">{price}</span>
                {showEconomy && (
                  <span className="text-sm font-bold text-textSecondary/60 line-through">
                    {formatMoney(data.base_total, data.currency)}
                  </span>
                )}
              </div>
              {showEconomy && (
                <p className="mt-1 text-[12px] font-900 uppercase tracking-widest text-green-600">
                  Экономия {formatMoney(economy, data.currency)}
                </p>
              )}

              <div className="mt-5 space-y-3">
                <Link to={bookHref} className="block">
                  <Button variant="primary" size="lg" fullWidth>
                    Оформить запись
                  </Button>
                </Link>
                <Link to={bookHref} className="block">
                  <Button variant="secondary" size="lg" fullWidth>
                    Выбрать время
                  </Button>
                </Link>
              </div>

              <div className="mt-5 rounded-sct border border-borderLight bg-surfaceLight p-4">
                <SpecRow label="Для авто" value={data.car_title} />
                {data.category?.name && <SpecRow label="Категория" value={data.category.name} />}
                <SpecRow label="Позиций" value={String(items.length)} />
                <SpecRow label="Пакет" value={`#${data.id}`} accent />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Мобильный sticky-бар */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-borderLight bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[10px] font-900 uppercase tracking-widest text-textSecondary">
              К оплате
            </p>
            <p className="truncate text-base font-900 text-brandBlue">{price}</p>
          </div>
          <Link
            to={bookHref}
            className="shrink-0 rounded-sct bg-brandBlue px-5 py-3 text-[12px] font-900 uppercase tracking-widest text-white"
          >
            Оформить запись
          </Link>
        </div>
      </div>
      <div className="h-20 md:hidden" />
    </section>
  )
}

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[11px] font-900 uppercase tracking-widest ${className}`}
    >
      {children}
    </span>
  )
}

function MiniCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-sct border border-borderLight bg-surfaceLight p-4">
      <p className="mb-2 text-[10px] font-900 uppercase tracking-widest text-textSecondary">{label}</p>
      <p className={`text-sm font-900 md:text-base ${accent ? 'text-brandBlue' : 'text-textPrimary'}`}>
        {value}
      </p>
    </div>
  )
}

function SpecRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-surfaceMuted py-3 first:border-t-0">
      <span className="text-[11px] font-900 uppercase tracking-widest text-textSecondary">{label}</span>
      <span className={`text-right text-sm font-900 ${accent ? 'text-brandBlue' : 'text-textPrimary'}`}>
        {value}
      </span>
    </div>
  )
}

function PackageGlyph() {
  return (
    <svg className="h-16 w-16 text-brandBlue/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 7.5l-9-5-9 5m18 0l-9 5m9-5v9l-9 5m0-9l-9-5m9 5v9m-9-14v9l9 5"
      />
    </svg>
  )
}

function formatQty(quantity: string | number | null | undefined, itemType: string): string {
  if (quantity === null || quantity === undefined) return ''
  const num = typeof quantity === 'string' ? Number(quantity) : quantity
  if (!Number.isFinite(num)) return String(quantity)
  const unit = itemType === 'SERVICE' ? 'усл.' : 'шт.'
  const formatted = num % 1 === 0 ? String(num) : String(num).replace(/0+$/, '').replace(/\.$/, '')
  return `${formatted} ${unit}`
}
