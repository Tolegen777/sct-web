import { useParams } from 'react-router-dom'

export default function EditCarPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <section className="container-sct py-12">
      <h1 className="text-3xl font-900 uppercase italic tracking-tight">
        Редактирование авто #{id}
      </h1>
      <p className="mt-2 text-textSecondary">
        TODO: PATCH /garage/cars/{id}/ (nickname + mileage_km).
      </p>
    </section>
  )
}
