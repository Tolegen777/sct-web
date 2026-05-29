import { AddCarWizard } from '@/features/garage/add-car/AddCarWizard'

export default function AddCarPage() {
  return (
    <section className="container-sct py-6 md:py-10">
      {/* На desktop — крупный заголовок; на мобиле его роль выполняет
          «‹ N. Шаг» в Stepper (по дизайну new_screens). */}
      <h1 className="mb-8 hidden text-3xl font-900 uppercase tracking-tight text-textPrimary md:block md:text-4xl lg:text-5xl">
        Добавление автомобиля
      </h1>

      <AddCarWizard />
    </section>
  )
}
