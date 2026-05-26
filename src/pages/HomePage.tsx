/**
 * Главная страница — dashboard для клиента, лендинг для гостя.
 *
 * Layout по дизайну:
 *   Left (8 col):  Hero → Активное авто (только для авторизованных) → Promo
 *   Right (4 col): «Мой гараж» (только для авторизованных)
 *
 * Гость: правая колонка скрыта; блок «Активное авто» не показываем —
 * вместо него только Hero (с CTA «Зарегистрироваться/Войти») + Promo.
 */
import { useAuthStore } from '@/features/auth/store'
import { useCarsQuery } from '@/features/garage/queries'
import { HomeHero } from '@/features/home/HomeHero'
import { HomePromoBanner } from '@/features/home/HomePromoBanner'
import { ActiveCarBlock } from '@/features/home/ActiveCarBlock'
import { MyGarageColumn } from '@/features/home/MyGarageColumn'

export default function HomePage() {
  const phase = useAuthStore((s) => s.phase)
  const isAuthed = phase === 'authed'

  // Для гостя список авто не запрашиваем (вернёт 401).
  const carsQuery = useCarsQuery()
  const hasCars = isAuthed && (carsQuery.data?.length ?? 0) > 0

  return (
    <section className="container-sct py-6 md:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Основная колонка */}
        <div className="space-y-6 lg:col-span-8 lg:space-y-7">
          <HomeHero hasCars={hasCars} />
          {isAuthed && <ActiveCarBlock />}
          <HomePromoBanner />
        </div>

        {/* Правая колонка — только для авторизованных */}
        {isAuthed && (
          <aside className="lg:col-span-4">
            <MyGarageColumn />
          </aside>
        )}
      </div>
    </section>
  )
}
