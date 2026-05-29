/**
 * Детальная страница пакета услуги (по дизайну new_screens).
 *
 * Layout: слева — длинный контент (промо-плашка, состав пакета, что получает
 * клиент, подробное описание, как проходит услуга), справа — липкий сайдбар
 * (фото, цена, «для какого авто», преимущества, кнопка «Записаться»).
 * Снизу — тёмный CTA-баннер.
 *
 * Блоки «Что получает клиент», «Как проходит услуга», «Преимущества» —
 * маркетинговая статика (одинаковы для всех пакетов; бэк их не отдаёт).
 *
 * «Записаться» ведёт на /services/:id/book.
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
import type { ClientPackageItem, ClientServicePackage } from '@/shared/api/types'

const CLIENT_BENEFITS = [
  'Официальная гарантия на все работы и установленные запчасти.',
  'Только оригинальные расходники и сертифицированные материалы.',
  'Прозрачная фиксированная цена пакета — без доплат на месте.',
  'Опытные мастера и современное диагностическое оборудование.',
]

const PROCESS_STEPS = [
  { title: 'Онлайн-запись', desc: 'Выбираете филиал, дату и удобное время в личном кабинете.' },
  { title: 'Приёмка авто', desc: 'Мастер принимает автомобиль и подтверждает состав работ.' },
  { title: 'Выполнение работ', desc: 'Проводим обслуживание по регламенту с оригинальными материалами.' },
  { title: 'Выдача и отчёт', desc: 'Возвращаем авто, фиксируем работы в сервисной книжке.' },
]

const PACKAGE_PERKS = [
  'Фиксированная цена пакета',
  'Гарантия на работы',
  'Оригинальные запчасти',
]

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
  const goBook = () => navigate(`/services/${data.id}/book`)

  return (
    <section className="container-sct py-6 md:py-10">
      <Link
        to="/services"
        className="mb-6 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        К услугам
      </Link>

      <header className="mb-8">
        <span className="text-[11px] font-900 uppercase tracking-widest text-brandBlue">
          {data.category.name}
        </span>
        <h1 className="mt-2 text-3xl font-900 uppercase leading-tight tracking-tight text-textPrimary md:text-4xl">
          {shortTitle} <span className="text-brandBlue">{data.car_title}</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Левая колонка — контент */}
        <div className="space-y-6 lg:col-span-8">
          {data.has_promotion && (data.promotion_title || hasDiscount) && (
            <Card className="border-l-4 border-brandYellow bg-brandYellow/10 p-5 md:p-6">
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
                  <span className="shrink-0 rounded-lg bg-brandYellow px-3 py-2 text-lg font-900 leading-none text-textPrimary">
                    −{Number(data.discount_percent)}%
                  </span>
                )}
              </div>
            </Card>
          )}

          <PackageComposition items={data.package_items} />

          <Card className="p-5 md:p-6">
            <SectionTitle>Что получает клиент</SectionTitle>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {CLIENT_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm font-medium text-textPrimary">
                  <CheckIcon />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </Card>

          {data.description && (
            <Card className="p-5 md:p-6">
              <SectionTitle>Подробное описание пакета</SectionTitle>
              <p className="mt-3 whitespace-pre-line text-sm font-medium leading-relaxed text-textPrimary">
                {data.description}
              </p>
            </Card>
          )}

          <Card className="p-5 md:p-6">
            <SectionTitle>Как проходит услуга</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {PROCESS_STEPS.map((step, i) => (
                <div key={step.title} className="rounded-sct border border-borderLight bg-surfaceLight/50 p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandBlue text-[12px] font-900 text-white">
                    {i + 1}
                  </span>
                  <h4 className="mt-3 text-sm font-900 uppercase tracking-tight text-textPrimary">
                    {step.title}
                  </h4>
                  <p className="mt-1 text-[13px] font-medium leading-relaxed text-textSecondary">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Правая колонка — липкий сайдбар */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-24">
            <Card className="overflow-hidden p-0">
              <div className="aspect-[4/3] w-full bg-surfaceLight">
                <SafeImage
                  src={data.image_url || undefined}
                  alt={shortTitle}
                  className="h-full w-full object-cover"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-textSecondary">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.1v5.7a2.25 2.25 0 01-.66 1.6L5 14.5m4.75-11.4a24 24 0 014.5 0m0 0v5.7c0 .6.24 1.17.66 1.6L19.8 15.3" />
                      </svg>
                    </div>
                  }
                />
              </div>

              <div className="p-5">
                <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                  Итоговая стоимость
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-900 tracking-tighter text-brandBlue">{price}</span>
                  {hasDiscount && (
                    <span className="text-sm font-bold text-textSecondary/60 line-through">
                      {formatMoney(data.base_total, data.currency)}
                    </span>
                  )}
                </div>

                <div className="mt-4 rounded-sct border border-borderLight bg-surfaceLight/60 p-3">
                  <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                    Для какого авто
                  </p>
                  <p className="mt-1 text-sm font-900 uppercase tracking-tight text-textPrimary">
                    {data.car_title}
                  </p>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                    Преимущества пакета
                  </p>
                  <ul className="mt-2 space-y-2">
                    {PACKAGE_PERKS.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-[13px] font-medium text-textPrimary">
                        <CheckIcon />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={goBook}
                  className="mt-5 w-full rounded-sct bg-brandBlue py-3.5 text-[12px] font-900 uppercase tracking-widest text-white shadow-soft-blue transition-all hover:bg-brandBlueDark"
                >
                  Записаться
                </button>
              </div>
            </Card>
          </div>
        </aside>
      </div>

      {/* Тёмный CTA */}
      <div className="mt-8 overflow-hidden rounded-sct-lg bg-navy p-6 text-white md:mt-10 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-900 uppercase leading-tight tracking-tight md:text-2xl">
              Запишитесь на обслуживание<br className="hidden md:inline" /> без лишних звонков
            </h3>
            <p className="mt-2 text-sm font-medium text-white/70">
              Онлайн-запись занимает пару минут — выберите филиал и удобное время.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <div className="text-right">
              <p className="text-[10px] font-900 uppercase tracking-widest text-white/50">Итого</p>
              <p className="text-2xl font-900 tracking-tighter text-brandYellow">{price}</p>
            </div>
            <button
              type="button"
              onClick={goBook}
              className="rounded-sct bg-white px-7 py-4 text-[12px] font-900 uppercase tracking-widest text-textPrimary transition-all hover:bg-brandYellow"
            >
              Записаться
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-900 uppercase tracking-tight text-textPrimary md:text-lg">
      {children}
    </h3>
  )
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-brandBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function PackageComposition({ items }: { items: ClientServicePackage['package_items'] }) {
  if (!items || items.length === 0) return null
  return (
    <Card className="overflow-hidden">
      <header className="border-b border-borderLight bg-surfaceLight px-5 py-4 md:px-6">
        <h3 className="text-[11px] font-900 uppercase tracking-widest text-textSecondary">
          Состав пакета
        </h3>
      </header>
      <ul className="divide-y divide-borderLight">
        {items.map((item) => (
          <CompositionRow key={item.id} item={item} />
        ))}
      </ul>
    </Card>
  )
}

function CompositionRow({ item }: { item: ClientPackageItem }) {
  const isService = item.item_type === 'SERVICE'
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3.5 md:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-textPrimary">{item.item_name}</p>
        <p className="mt-0.5 text-[10px] font-900 uppercase tracking-widest text-brandBlue">
          {isService ? 'Работа' : 'Товар'}
        </p>
      </div>
      <span className="whitespace-nowrap text-sm font-900 text-textPrimary">
        {formatQty(item.quantity, item.item_type)}
      </span>
    </li>
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
