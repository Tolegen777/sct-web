/**
 * Секция «Преимущества» на гостевой главной — 3 карточки в ряд.
 *
 * Статический маркетинговый контент (без API). По дизайну new_screens:
 * белые карточки, светло-голубой бокс с иконкой слева, заголовок справа
 * от иконки, описание ниже.
 */

interface Benefit {
  title: string
  desc: string
  icon: string // SVG path (stroke)
}

const BENEFITS: Benefit[] = [
  {
    title: 'Гарантия качества',
    desc: 'Мы предоставляем официальную гарантию на все выполненные работы и установленные запчасти.',
    icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.572-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.285z',
  },
  {
    title: 'Полная прозрачность',
    desc: 'Никаких скрытых платежей. Вы заранее знаете точную стоимость пакета услуг для вашего авто.',
    icon: 'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Экономия времени',
    desc: 'Записывайтесь онлайн в два клика, выбирайте удобное время и филиал прямо в личном кабинете.',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]

export function WhyUsSection() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {BENEFITS.map((b) => (
        <article
          key={b.title}
          className="rounded-sct border border-borderLight bg-white p-6 shadow-sct-soft"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brandBlue">
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
                  d={b.icon}
                />
              </svg>
            </div>
            <h3 className="text-base font-900 uppercase leading-tight tracking-tight text-textPrimary">
              {b.title}
            </h3>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-textSecondary">
            {b.desc}
          </p>
        </article>
      ))}
    </section>
  )
}
