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
        <div className="max-w-[55%]">
          <h1 className="text-2xl font-900 uppercase italic leading-[1.05] tracking-tight md:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-sm font-medium text-white/70 md:text-base">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {isAuthed ? (
              hasCars ? (
                <>
                  <Link
                    to="/services"
                    className="rounded-sct bg-brandBlue px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white shadow-lg transition-all hover:bg-brandBlueDark"
                  >
                    Записаться на сервис
                  </Link>
                  <Link
                    to="/garage"
                    className="rounded-sct border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white backdrop-blur transition-all hover:bg-white/10"
                  >
                    Открыть гараж
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/garage/add"
                    className="rounded-sct bg-brandBlue px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white shadow-lg transition-all hover:bg-brandBlueDark"
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
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSearchParams({ modal: 'register' })}
                  className="rounded-sct bg-brandBlue px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white shadow-lg transition-all hover:bg-brandBlueDark"
                >
                  Зарегистрироваться
                </button>
                <button
                  type="button"
                  onClick={() => setSearchParams({ modal: 'login' })}
                  className="rounded-sct border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-900 uppercase tracking-widest text-white backdrop-blur transition-all hover:bg-white/10"
                >
                  Войти
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
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
