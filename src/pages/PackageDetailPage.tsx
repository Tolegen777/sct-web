/**
 * Детальная страница пакета услуги.
 *
 * Раскладка: слева — фото пакета (3:4) + блок акции, справа — состав
 * (список товаров и работ) + итоговая цена + кнопка «Записаться».
 *
 * «Записаться» ведёт на /services/:id/book — упрощённый flow с выбором
 * машины и желаемой даты. Когда бэк добавит /branches/ и /slots/,
 * проапгрейдим до полного 4-шагового workflow с филиалом и слотом.
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

export default function PackageDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : undefined
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  const { data, isLoading, isError, refetch } = usePackageQuery(id)

  // Для гостя query disabled — показываем приглашение залогиниться.
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

  return (
    <section className="container-sct py-8 md:py-12">
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-blue-50 px-3 py-1 text-[11px] font-900 uppercase tracking-widest text-brandBlue">
            {data.category.name}
          </span>
          {data.has_promotion && (
            <span className="rounded-md bg-brandOrange px-3 py-1 text-[11px] font-900 uppercase tracking-widest text-white">
              Акция
            </span>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-900 uppercase italic leading-none tracking-tight text-textPrimary md:text-5xl">
          {shortTitle}
        </h1>
        <p className="mt-3 text-sm font-bold uppercase italic tracking-tight text-textSecondary md:text-base">
          {data.car_title}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {/* Левая колонка — обложка + акция + краткое описание */}
        <div className="space-y-6 md:col-span-5">
          <div className="aspect-[3/4] w-full overflow-hidden rounded-sct-lg border border-borderLight bg-surfaceLight">
            <SafeImage
              src={data.image_url || undefined}
              alt={shortTitle}
              className="h-full w-full object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-6xl">🛠️</div>
              }
            />
          </div>

          {data.has_promotion && data.promotion_title && (
            <Card className="border-2 border-brandYellow bg-surfaceLight p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brandYellow/30 p-2 text-orange-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <p className="text-sm font-900 uppercase italic tracking-tight text-textPrimary">
                  {data.promotion_title}
                </p>
              </div>
              {data.promotion_terms && (
                <p className="mt-3 text-sm font-medium italic leading-relaxed text-textSecondary">
                  {data.promotion_terms}
                </p>
              )}
            </Card>
          )}

          {data.short_description && (
            <Card className="p-5">
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Кратко
              </p>
              <p className="mt-2 text-sm font-medium italic leading-relaxed text-textSecondary">
                {data.short_description}
              </p>
            </Card>
          )}
        </div>

        {/* Правая колонка — состав, описание, итог, кнопка */}
        <div className="space-y-6 md:col-span-7">
          <PackageComposition items={data.package_items} />

          {data.description && (
            <Card className="p-5 md:p-6">
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Описание
              </p>
              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed text-textPrimary">
                {data.description}
              </p>
            </Card>
          )}

          <Card className="p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                  Итоговая стоимость
                </p>
                {hasDiscount && (
                  <p className="mt-1 text-sm font-bold uppercase line-through opacity-60">
                    {formatMoney(data.base_total, data.currency)}
                  </p>
                )}
                <p className="mt-1 text-4xl font-900 italic leading-none tracking-tighter text-brandBlue md:text-5xl">
                  {formatMoney(data.final_price, data.currency)}
                </p>
                {hasDiscount && (
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-brandOrange">
                    {data.discount_type_display}
                    {data.discount_type === 'PERCENT' && ` —${data.discount_percent}%`}
                  </p>
                )}
              </div>

              <Button
                size="lg"
                onClick={() => navigate(`/services/${data.id}/book`)}
              >
                Записаться
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

function PackageComposition({ items }: { items: ClientServicePackage['package_items'] }) {
  if (!items || items.length === 0) return null

  // Разделяем на товары и услуги — это улучшает читаемость.
  const products = items.filter((i) => i.item_type === 'PRODUCT')
  const services = items.filter((i) => i.item_type === 'SERVICE')

  return (
    <Card className="overflow-hidden">
      <header className="border-b border-borderLight bg-surfaceLight px-5 py-4 md:px-6">
        <h3 className="text-[11px] font-900 uppercase tracking-widest text-textSecondary">
          Состав пакета
        </h3>
      </header>
      <div className="divide-y divide-borderLight">
        {services.length > 0 && (
          <ItemsGroup label="Работы" items={services} />
        )}
        {products.length > 0 && (
          <ItemsGroup label="Запчасти и расходники" items={products} />
        )}
      </div>
    </Card>
  )
}

function ItemsGroup({ label, items }: { label: string; items: ClientPackageItem[] }) {
  return (
    <section>
      <header className="bg-surfaceLight/60 px-5 py-2.5 md:px-6">
        <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
          {label}
        </p>
      </header>
      <ul className="divide-y divide-borderLight">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 px-5 py-3 text-sm md:px-6"
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-textPrimary">{item.item_name}</p>
              {item.item_article && (
                <p className="mt-0.5 truncate font-mono text-[10px] text-textSecondary/70">
                  арт. {item.item_article}
                </p>
              )}
            </div>
            <span className="whitespace-nowrap text-sm font-900 italic text-textPrimary">
              {formatQty(item.quantity, item.item_type)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function formatQty(quantity: string | number | null | undefined, itemType: string): string {
  if (quantity === null || quantity === undefined) return ''
  const num = typeof quantity === 'string' ? Number(quantity) : quantity
  if (!Number.isFinite(num)) return String(quantity)
  const unit = itemType === 'SERVICE' ? 'усл.' : 'шт.'
  // 1.000 → 1, 1.500 → 1.5
  const formatted = num % 1 === 0 ? String(num) : String(num).replace(/0+$/, '').replace(/\.$/, '')
  return `${formatted} ${unit}`
}
