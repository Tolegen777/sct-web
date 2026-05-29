/**
 * Тёмный hero-блок главной страницы.
 *
 * Дизайн: тёмно-синий блок с фоновой иллюстрацией мастера справа,
 * слева — заголовок «Нурсултан, ваш автомобиль готов к сервису» (с
 * персонализацией для авторизованного клиента) + 2 кнопки:
 *
 *  - Авторизованный с авто: «ЗАПИСАТЬСЯ НА СЕРВИС» + «ОТКРЫТЬ ГАРАЖ»
 *  - Авторизованный без авто: «ДОБАВИТЬ АВТО» + «ВСЕ УСЛУГИ»
 *  - Гость:                    «ЗАРЕГИСТРИРОВАТЬСЯ» + «ВОЙТИ»
 *
 * Фото мастера пока — заглушка (SVG-силуэт в правой части); как ПМ
 * пришлёт реальное брендовое фото, заменим.
 */
import { Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'

interface HomeHeroProps {
  hasCars: boolean
}

export function HomeHero({ hasCars }: HomeHeroProps) {
  const phase = useAuthStore((s) => s.phase)
  const profile = useAuthStore((s) => s.profile)
  const [, setSearchParams] = useSearchParams()
  const isAuthed = phase === 'authed'

  // Гость видит маркетинговый hero (по дизайну new_screens),
  // авторизованный — персонализированный дашборд-hero (ниже).
  if (!isAuthed) {
    return (
      <section className="relative overflow-hidden rounded-sct-lg bg-navy text-white">
        <HeroPhoto />

        <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="md:max-w-[58%]">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-900 uppercase tracking-widest text-white/80 ring-1 ring-inset ring-white/15">
              Официальный автосервис
            </span>
            <h1 className="mt-5 text-3xl font-900 uppercase leading-[1.05] tracking-tight md:text-4xl lg:text-5xl">
              Премиальное обслуживание вашего автомобиля
            </h1>
            <p className="mt-5 max-w-lg text-sm font-medium text-white/70 md:text-base">
              Прозрачные цены, гарантия на все виды работ и персональный
              подход. Зарегистрируйтесь в личном кабинете, добавьте свой
              автомобиль и получите доступ к акциям и онлайн-записи.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setSearchParams({ modal: 'register' })}
                className="rounded-sct bg-brandYellow px-6 py-3.5 text-[12px] font-900 uppercase tracking-widest text-textPrimary shadow-lg transition-all hover:brightness-95"
              >
                Зарегистрироваться
              </button>
              <button
                type="button"
                onClick={() => setSearchParams({ modal: 'login' })}
                className="rounded-sct bg-white/10 px-6 py-3.5 text-[12px] font-900 uppercase tracking-widest text-white ring-1 ring-inset ring-white/15 backdrop-blur transition-all hover:bg-white/15"
              >
                Войти по номеру
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const firstName = profile?.first_name?.trim()
  const title =
    isAuthed && firstName
      ? `${firstName.toUpperCase()}, ВАШ АВТОМОБИЛЬ ГОТОВ К СЕРВИСУ`
      : 'ВАШ АВТОМОБИЛЬ ГОТОВ К СЕРВИСУ'
  const subtitle =
    'Мы подобрали актуальные пакеты, акции и ближайшие слоты обслуживания для вашего автомобиля.'

  return (
    <section className="relative overflow-hidden rounded-sct-lg bg-navy text-white">
      <BackdropPhoto />

      <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="md:max-w-[60%]">
          <h1 className="text-2xl font-900 uppercase leading-[1.05] tracking-tight md:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm font-medium text-white/70 md:text-base">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {hasCars ? (
              <>
                <Link
                  to="/services"
                  className="rounded-sct bg-white px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-textPrimary shadow-lg transition-all hover:bg-brandYellow"
                >
                  Записаться на сервис
                </Link>
                <Link
                  to="/garage/add"
                  className="rounded-sct border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white backdrop-blur transition-all hover:bg-white/10"
                >
                  Добавить авто
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/garage/add"
                  className="rounded-sct bg-white px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-textPrimary shadow-lg transition-all hover:bg-brandYellow"
                >
                  Добавить авто
                </Link>
                <Link
                  to="/services"
                  className="rounded-sct border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white backdrop-blur transition-all hover:bg-white/10"
                >
                  Все услуги
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Правая часть гостевого hero — фото обслуживаемого автомобиля.
 *
 * Пока реального ассета нет (см. PROJECT_STATUS §4.1). Чтобы вставить фото:
 *   1. положи файл в `public/` (например `public/hero-service.jpg`);
 *   2. раскомментируй <img> ниже и удали градиент-заглушку.
 * Градиент слева->направо растворяет фото в navy, чтобы текст читался.
 */
function HeroPhoto() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] md:block">
      {/* Заглушка: фотографический тёмный градиент. Заменить на <img>. */}
      <div className="h-full w-full bg-gradient-to-br from-[#10254f] via-navy to-navyDeep" />
      {/* <img src="/hero-service.jpg" alt="" className="h-full w-full object-cover" /> */}

      {/* Лёгкое голубое свечение справа сверху для глубины */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brandBlue/20 blur-3xl" />

      {/* Растворение в navy слева, чтобы заголовок читался поверх стыка */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/40 to-transparent" />
    </div>
  )
}

/**
 * Декоративный фон Hero. В оригинальном макете — фото мастера в форме SCT
 * с большим логотипом SCT за спиной. Здесь — лёгкий пейзаж шиномонтажа из
 * градиента + большой полупрозрачный SCT-логотип за «человеком».
 */
function BackdropPhoto() {
  return (
    <>
      {/* Лёгкий градиент справа */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-navyDeep via-navy/60 to-navy md:block" />
      {/* Большое лого-водянка справа */}
      <div className="pointer-events-none absolute right-8 top-6 hidden text-white/[0.04] md:block">
        <svg className="h-40 w-40 lg:h-52 lg:w-52" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" fill="none" />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="22"
            fontWeight="900"
            fontStyle="italic"
            fill="currentColor"
          >
            SCT
          </text>
        </svg>
      </div>
      {/* Силуэт мастера (плейсхолдер до брендовой фотографии) */}
      <div className="pointer-events-none absolute bottom-0 right-6 hidden md:right-10 md:flex md:items-end lg:right-20">
        <svg
          className="h-56 w-44 text-white/[0.10] lg:h-72 lg:w-56"
          viewBox="0 0 120 200"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="60" cy="40" r="22" />
          <path d="M20 200 C 20 130, 100 130, 100 200 Z" />
        </svg>
      </div>
      {/* Светлый круг сверху-слева для глубины */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-brandBlue/10 blur-3xl" />
    </>
  )
}
