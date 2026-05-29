import { Link } from 'react-router-dom'

/**
 * Empty-state для пустого гаража (по дизайну new_screens).
 *
 * Большой фото-баннер интерьера сервиса SCT на всю ширину, поверх по центру —
 * белая карточка с пунктирной рамкой: круглая «+», заголовок, текст и синяя
 * кнопка «Добавить автомобиль».
 *
 * Фото пока заглушка (ассета нет — см. PROJECT_STATUS §4). Чтобы вставить:
 *   1. положи файл в `public/` (например `public/garage-banner.jpg`);
 *   2. раскомментируй <img> ниже.
 */
export function EmptyGarage() {
  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-sct-lg bg-navy p-5 md:min-h-[560px] md:p-10">
      {/* Фон: заглушка-градиент «промышленного» бокса. Заменить на <img>. */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-500 via-slate-600 to-navy" />
      {/* <img src="/garage-banner.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" /> */}
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Оверлей-карточка */}
      <div className="relative z-10 w-full max-w-md rounded-sct-lg border-2 border-dashed border-borderLight bg-white/95 px-6 py-10 text-center shadow-soft-card backdrop-blur-sm md:px-10 md:py-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-textPrimary shadow-sct md:h-20 md:w-20">
          <svg
            className="h-7 w-7 md:h-8 md:w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 5v14m7-7H5"
            />
          </svg>
        </div>

        <h2 className="mt-6 text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
          Гараж пуст
        </h2>
        <p className="mx-auto mt-3 max-w-xs text-sm font-medium text-textSecondary">
          Добавьте ваш автомобиль, чтобы SCT Service сохранял историю
          обслуживания.
        </p>

        <Link
          to="/garage/add"
          className="mt-8 inline-flex h-14 items-center justify-center rounded-sct bg-brandBlue px-8 text-sm font-900 uppercase tracking-[0.15em] text-white shadow-soft-blue transition-all hover:bg-brandBlueDark active:scale-[0.98]"
        >
          Добавить автомобиль
        </Link>
      </div>
    </div>
  )
}
