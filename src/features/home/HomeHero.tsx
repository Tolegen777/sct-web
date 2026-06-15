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
import { SafeImage } from '@/shared/ui/SafeImage'

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
        <HeroBackdrop variant="guest" />

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
      <HeroBackdrop variant="authed" />

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
 * Фон Hero — фото на весь блок (видно и на мобилке, и на десктопе).
 *
 * Реальные брендовые фото кладём в `public/`:
 *   - гость:        `public/hero-guest.jpg`   (обслуживаемый автомобиль)
 *   - авторизован.: `public/hero-advisor.jpg` (мастер в форме SCT)
 * Пока файла нет — `SafeImage` показывает декоративный фолбэк (градиент +
 * водяной знак SCT), как только файл появится — подхватится автоматически,
 * код менять не нужно.
 *
 * Поверх фото — затемнение для читаемости заголовка:
 *   - мобилка: общий navy-слой (текст идёт поверх всего фото);
 *   - десктоп: градиент слева→направо (текст слева на тёмном, фото справа).
 */
function HeroBackdrop({ variant }: { variant: 'guest' | 'authed' }) {
  const src = variant === 'guest' ? '/hero-guest.jpg' : '/hero-advisor.jpg'

  // Авторизованный: на фото мастер по центру кадра. Full-bleed «утапливает»
  // его в текстовый градиент слева, поэтому:
  //   - desktop: фото правой панелью (мастер виден справа, текст слева на navy);
  //   - mobile:  фон на всю карточку, но кадр сдвинут влево (object-left) —
  //     мастер уходит вправо, текст слева не налезает на лицо.
  if (variant === 'authed') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Desktop — правая фото-панель */}
        <div className="absolute inset-y-0 right-0 hidden w-[54%] md:block">
          <SafeImage
            src={src}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
            fallback={<HeroBackdropFallback />}
          />
          {/* Растворение левого края панели в navy под текст */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/30 to-transparent" />
        </div>

        {/* Mobile — фон на всю карточку, кадр сдвинут влево (мастер вправо) */}
        <div className="absolute inset-0 md:hidden">
          <SafeImage
            src={src}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-left"
            fallback={<HeroBackdropFallback />}
          />
          {/* Затемнение слева под текст, мастер справа остаётся светлее */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/40" />
        </div>

        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brandBlue/20 blur-3xl" />
      </div>
    )
  }

  // Гость: фото авто (субъект справа кадра) — full-bleed работает отлично.
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <SafeImage
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
        fallback={<HeroBackdropFallback />}
      />

      {/* Затемнение под текст */}
      <div className="absolute inset-0 bg-navy/70 md:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-navy via-navy/85 to-navy/20 md:block" />

      {/* Лёгкое свечение для глубины */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brandBlue/20 blur-3xl" />
    </div>
  )
}

/** Декоративная заглушка, пока нет реального фото в public/. */
function HeroBackdropFallback() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#10254f] via-navy to-navyDeep" />
      {/* Водяной знак SCT справа */}
      <div className="absolute right-6 top-6 text-white/[0.05]">
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
    </>
  )
}
