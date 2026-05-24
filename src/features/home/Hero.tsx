/**
 * Главный hero лендинга.
 *
 * Для гостя:    «Ваш автомобиль готов к сервису» + кнопки «Регистрация» / «Войти».
 * Для клиента:  «<Имя>, ваш автомобиль готов к сервису» + «Записаться» / «Гараж».
 *
 * Фон — синий градиент с декоративным паттерном (силуэты гаечных ключей).
 * Фотография мастера справа — потом возьмём из брендового набора, пока
 * decorative SVG.
 */
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'
import { Button } from '@/shared/ui/Button'
import { useSearchParams } from 'react-router-dom'

export function HomeHero() {
  const profile = useAuthStore((s) => s.profile)
  const phase = useAuthStore((s) => s.phase)
  const [, setSearchParams] = useSearchParams()

  const isAuthed = phase === 'authed'
  const firstName = profile?.first_name?.trim()

  const greeting = isAuthed && firstName
    ? `${firstName}, ваш автомобиль готов к сервису`
    : 'Ваш автомобиль готов к сервису'

  const subtitle = isAuthed
    ? 'Подобрали актуальные пакеты и рекомендации под вашу машину. Записывайтесь онлайн.'
    : 'Записывайтесь онлайн, ведите сервисную книжку и получайте рекомендации по обслуживанию.'

  return (
    <section className="relative overflow-hidden rounded-sct-xl bg-gradient-to-br from-brandBlue via-brandBlue to-brandBlueDark p-6 text-white shadow-soft-blue md:p-12 lg:p-16">
      <DecorativeBackdrop />

      <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7 lg:col-span-8">
          <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandYellow md:text-xs">
            SCT Service
          </p>
          <h1 className="mt-4 text-3xl font-900 uppercase italic leading-[1.05] tracking-tight md:text-5xl lg:text-[56px]">
            {greeting}
          </h1>
          <p className="mt-6 max-w-xl text-sm font-medium opacity-90 md:text-base">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {isAuthed ? (
              <>
                <Link to="/services">
                  <Button variant="dark" size="lg">
                    Записаться на сервис
                  </Button>
                </Link>
                <Link to="/garage">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                  >
                    Открыть гараж
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="dark"
                  size="lg"
                  onClick={() => setSearchParams({ modal: 'register' })}
                >
                  Зарегистрироваться
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="!bg-white/10 !text-white !border-white/20 hover:!bg-white/20"
                  onClick={() => setSearchParams({ modal: 'login' })}
                >
                  Войти
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Декоративная иллюстрация справа — только на широком экране */}
        <div className="hidden md:col-span-5 md:flex md:items-center md:justify-center lg:col-span-4">
          <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm lg:h-56 lg:w-56">
            <svg
              className="h-24 w-24 text-brandYellow lg:h-32 lg:w-32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

function DecorativeBackdrop() {
  return (
    <>
      {/* Большой круг сверху-справа */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
      {/* Меньший круг снизу-слева */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brandYellow/10 blur-3xl" />
      {/* Лого-водянка справа */}
      <div className="pointer-events-none absolute right-8 top-8 hidden text-white/5 md:block">
        <svg className="h-32 w-32 lg:h-40 lg:w-40" fill="currentColor" viewBox="0 0 100 100">
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
