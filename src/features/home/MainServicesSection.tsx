/**
 * Секция «Наши основные услуги» на гостевой главной — 4 карточки.
 *
 * Статический маркетинговый контент (без API). По дизайну new_screens:
 * eyebrow «НАПРАВЛЕНИЯ» + заголовок + ссылка «Смотреть все услуги»,
 * карточки с серым иконбоксом, заголовком, описанием и «Узнать цену →».
 *
 * Ссылки ведут на /services. Для гостя каталог пакетов закрыт JWT
 * (BACKEND_NOTES §3.3) — там пока экран «зарегистрируйтесь». Когда бэк
 * откроет публичный доступ, страница заработает для всех без изменений.
 */
import { Link } from 'react-router-dom'

interface ServiceItem {
  title: string
  desc: string
  icon: string // SVG path (stroke)
}

const SERVICES: ServiceItem[] = [
  {
    title: 'Замена масла и жидкостей',
    desc: 'Моторное масло, АКПП, антифриз и тормозная жидкость.',
    icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5',
  },
  {
    title: 'Техническое обслуживание',
    desc: 'Регламентное ТО, замена всех фильтров, свечей зажигания.',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
  {
    title: 'Диагностика ходовой',
    desc: 'Полная проверка подвески, рулевого управления и амортизаторов.',
    icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Тормозная система',
    desc: 'Замена тормозных колодок, дисков, проточка и обслуживание суппортов.',
    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  },
]

export function MainServicesSection() {
  return (
    <section>
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-900 uppercase tracking-widest text-brandBlue">
            Направления
          </p>
          <h2 className="mt-1 text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
            Наши основные услуги
          </h2>
        </div>
        <Link
          to="/services"
          className="shrink-0 text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Смотреть все услуги →
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <Link
            key={s.title}
            to="/services"
            className="group flex flex-col rounded-sct border border-borderLight bg-white p-6 transition-all hover:border-brandBlue/40 hover:shadow-soft-card"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surfaceMuted text-textPrimary">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d={s.icon}
                />
              </svg>
            </div>
            <h3 className="mt-5 text-base font-900 uppercase leading-tight tracking-tight text-textPrimary">
              {s.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-textSecondary">
              {s.desc}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 border-t border-borderLight pt-4 text-[11px] font-900 uppercase tracking-widest text-brandBlue">
              Узнать цену
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
