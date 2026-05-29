/**
 * Лендинг услуги-категории (по дизайну new_screens, img_12/13).
 *
 * Публичная маркетинговая страница по коду категории: что включает услуга,
 * что получает клиент, почему стоимость разная, как проходит обслуживание,
 * и CTA на подбор пакета. Контент — статика (бэк отдаёт только пакеты внутри
 * категории, без описания самой категории), заголовок маппим по коду.
 *
 * Маршрут: /services/info/:code
 */
import { Link, useParams } from 'react-router-dom'

const CATEGORY_TITLES: Record<string, string> = {
  engine_oil: 'Замена масла в двигателе',
  transmission_oil: 'Замена масла в АКПП',
  brake: 'Тормозная система',
  brakes: 'Тормозная система',
  maintenance: 'Техническое обслуживание',
  diagnostics: 'Диагностика ходовой',
  suspension: 'Диагностика ходовой',
  tire: 'Шиномонтаж',
  tires: 'Шиномонтаж',
}

const INCLUDES = [
  { title: 'Диагностика и осмотр', desc: 'Проверяем узлы и подбираем оптимальный объём работ под ваше авто.' },
  { title: 'Оригинальные расходники', desc: 'Используем сертифицированные материалы и проверенные бренды.' },
  { title: 'Работа мастеров', desc: 'Обслуживание по регламенту производителя на профессиональном оборудовании.' },
  { title: 'Запись в книжку', desc: 'Фиксируем выполненные работы в вашей электронной сервисной книжке.' },
]

const BENEFITS = [
  'Официальная гарантия на все работы и запчасти.',
  'Прозрачная фиксированная цена пакета без доплат.',
  'Экономия времени — запись онлайн в пару кликов.',
  'Контроль состояния авто и напоминания о ТО.',
]

const STEPS = [
  { title: 'Онлайн-запись', desc: 'Выбираете филиал, дату и удобное время.' },
  { title: 'Приёмка авто', desc: 'Мастер принимает автомобиль и подтверждает состав работ.' },
  { title: 'Выполнение работ', desc: 'Проводим обслуживание с оригинальными материалами.' },
  { title: 'Выдача и отчёт', desc: 'Возвращаем авто и фиксируем работы в книжке.' },
]

export default function ServiceInfoPage() {
  const { code } = useParams<{ code: string }>()
  const title = (code && CATEGORY_TITLES[code]) || 'Обслуживание автомобиля'

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

      {/* Hero */}
      <div className="relative overflow-hidden rounded-sct-lg bg-navy p-6 text-white md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brandBlue/20 blur-3xl" />
        <div className="relative z-10 md:max-w-[62%]">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-900 uppercase tracking-widest text-white/80 ring-1 ring-inset ring-white/15">
            Услуга
          </span>
          <h1 className="mt-5 text-3xl font-900 uppercase leading-[1.05] tracking-tight md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-sm font-medium text-white/70 md:text-base">
            Качественное и своевременное обслуживание напрямую влияет на ресурс,
            безопасность и стоимость вашего автомобиля.
          </p>
          <Link
            to="/services"
            className="mt-7 inline-flex rounded-sct bg-white px-6 py-3.5 text-[12px] font-900 uppercase tracking-widest text-textPrimary transition-all hover:bg-brandYellow"
          >
            Подобрать пакет
          </Link>
        </div>
      </div>

      {/* Что включает */}
      <section className="mt-8 md:mt-10">
        <SectionTitle>Что обычно включает услуга</SectionTitle>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INCLUDES.map((c) => (
            <div key={c.title} className="rounded-sct border border-borderLight bg-white p-5">
              <h3 className="text-sm font-900 uppercase tracking-tight text-textPrimary">{c.title}</h3>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-textSecondary">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Что получает клиент */}
      <section className="mt-8 md:mt-10">
        <SectionTitle>Что получает клиент</SectionTitle>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 rounded-sct border border-borderLight bg-white p-4 text-sm font-medium text-textPrimary">
              <CheckIcon />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Почему стоимость разная */}
      <section className="mt-8 md:mt-10">
        <SectionTitle>Почему стоимость разная</SectionTitle>
        <div className="mt-4 rounded-sct border border-borderLight bg-surfaceLight/50 p-5 md:p-6">
          <p className="text-sm font-medium leading-relaxed text-textSecondary">
            Итоговая цена зависит от модели и модификации автомобиля, объёма и типа
            расходников, состояния узлов и выбранного пакета. Поэтому мы рассчитываем
            стоимость под конкретное авто — без скрытых платежей и доплат на месте.
          </p>
        </div>
      </section>

      {/* Как проходит */}
      <section className="mt-8 md:mt-10">
        <SectionTitle>Как проходит обслуживание</SectionTitle>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="rounded-sct border border-borderLight bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandBlue text-[12px] font-900 text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-900 uppercase tracking-tight text-textPrimary">{step.title}</h3>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-textSecondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-8 overflow-hidden rounded-sct-lg bg-navy p-6 text-white md:mt-10 md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-900 uppercase leading-tight tracking-tight md:text-2xl">
              Отправьте данные автомобиля<br className="hidden md:inline" /> и получите точный расчёт
            </h3>
            <p className="mt-2 text-sm font-medium text-white/70">
              Добавьте авто в гараж — подберём пакеты с актуальными ценами под вашу модификацию.
            </p>
          </div>
          <Link
            to="/services"
            className="shrink-0 rounded-sct bg-white px-7 py-4 text-[12px] font-900 uppercase tracking-widest text-textPrimary transition-all hover:bg-brandYellow"
          >
            Подобрать пакет
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-900 uppercase tracking-tight text-textPrimary md:text-2xl">
      {children}
    </h2>
  )
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 h-4 w-4 shrink-0 text-brandBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  )
}
