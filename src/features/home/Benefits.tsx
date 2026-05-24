/**
 * Секция преимуществ — показываем гостям, чтобы убедить зарегистрироваться.
 * Простой грид из 4 пунктов: подбор по модификации, прозрачные цены, история,
 * запись онлайн.
 */
import { Card } from '@/shared/ui/Card'

interface Benefit {
  icon: string
  title: string
  description: string
}

const BENEFITS: Benefit[] = [
  {
    icon: '🎯',
    title: 'Подбор под модификацию',
    description:
      'Подбираем работы и запчасти точно под VIN и модификацию вашей машины.',
  },
  {
    icon: '💰',
    title: 'Прозрачная цена',
    description:
      'Стоимость и состав пакета видны до приёма. Никаких скрытых платежей.',
  },
  {
    icon: '📒',
    title: 'Сервисная книжка',
    description:
      'Все визиты, пробег и работы сохраняются в одном месте. Удобно при продаже авто.',
  },
  {
    icon: '⏰',
    title: 'Запись онлайн',
    description:
      'Выбираете филиал, дату и время — и приезжаете в назначенный слот.',
  },
]

export function Benefits() {
  return (
    <section>
      <header className="mb-6 md:mb-8">
        <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
          Почему SCT
        </p>
        <h2 className="mt-2 text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-4xl">
          Сервис, который<br className="hidden md:inline" /> работает на вас
        </h2>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {BENEFITS.map((b) => (
          <Card key={b.title} className="p-5 md:p-6">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surfaceLight text-2xl">
              {b.icon}
            </div>
            <h3 className="text-lg font-900 uppercase italic tracking-tight text-textPrimary">
              {b.title}
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-textSecondary">
              {b.description}
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}
