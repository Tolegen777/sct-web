import { Link } from 'react-router-dom'
import { AddCarWizard } from '@/features/garage/add-car/AddCarWizard'

export default function AddCarPage() {
  return (
    <section className="container-sct py-8 md:py-12">
      <header className="mb-6 flex items-center gap-4 md:mb-10">
        <Link
          to="/garage"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Назад в гараж
        </Link>
      </header>

      <h1 className="mb-8 text-3xl font-900 uppercase italic tracking-tight text-textPrimary md:mb-12 md:text-5xl">
        Добавление автомобиля
      </h1>

      <AddCarWizard />
    </section>
  )
}
