/**
 * Полноценный 4-шаговый wizard записи на сервис.
 *
 * Шаги: car → branch → datetime → confirm.
 *
 * Если у клиента в гараже одна машина, шаг «Авто» пропускается. Если по
 * URL пришло `?car_id=<id>`, шаг тоже пропускается, машина подставляется.
 *
 * На submit:
 *   POST /service-book/create_booking/
 *   payload: {client_car_id, service_package_id, preferred_datetime,
 *             service_station_id, comment}
 *
 * После успеха — редирект на /bookings/{new_id}.
 */
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usePackageQuery } from '@/features/packages/queries'
import { useCarsQuery } from '@/features/garage/queries'
import { useCreateBookingMutation } from '@/features/bookings/queries'
import { Spinner } from '@/shared/ui/Spinner'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { SafeImage } from '@/shared/ui/SafeImage'
import { Textarea } from '@/shared/ui/Textarea'
import { parseApiError } from '@/features/auth/errors'
import { formatMoney, formatDateTime } from '@/shared/lib/format'
import { getPackageShortTitle } from '@/features/packages/lib'
import { Stepper, type WizardStep } from '@/features/booking-wizard/Stepper'
import { BranchStep } from '@/features/booking-wizard/BranchStep'
import { DateTimeStep } from '@/features/booking-wizard/DateTimeStep'
import { localIsoToUtcIso } from '@/features/booking-wizard/lib'
import { cn } from '@/shared/lib/cn'
import type { ServiceStation } from '@/features/service-stations/types'
import type { ClientGarageCar } from '@/shared/api/types'

export default function BookServicePage() {
  const params = useParams<{ id: string }>()
  const packageId = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const packageQuery = usePackageQuery(packageId)
  const carsQuery = useCarsQuery()
  const createMut = useCreateBookingMutation()

  // === State машины ===
  const [step, setStep] = useState<WizardStep>('car')
  const [completed, setCompleted] = useState<WizardStep[]>([])

  const [selectedCarId, setSelectedCarId] = useState<number | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<ServiceStation | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null) // localIso
  const [comment, setComment] = useState('')
  // Пробег: подставляем последний известный из ClientCar и даём клиенту
  // обновить перед визитом. Бэк добавит в историю пробега.
  const [mileage, setMileage] = useState<string>('')
  const [serverError, setServerError] = useState<string | null>(null)

  // === Подставляем дефолты после загрузки гаража ===
  const defaultCarId = useMemo(() => {
    const fromUrl = Number(searchParams.get('car_id'))
    if (Number.isFinite(fromUrl) && fromUrl > 0) return fromUrl
    return undefined
  }, [searchParams])

  useEffect(() => {
    if (!carsQuery.data || selectedCarId !== null) return
    const cars = carsQuery.data
    if (defaultCarId && cars.some((c) => c.id === defaultCarId)) {
      setSelectedCarId(defaultCarId)
      // Если в URL уже есть car_id или в гараже одна машина — пропускаем шаг.
      setStep('branch')
      setCompleted(['car'])
      return
    }
    if (cars.length === 1) {
      setSelectedCarId(cars[0].id)
      setStep('branch')
      setCompleted(['car'])
      return
    }
    const active = cars.find((c) => c.is_default)
    if (active) setSelectedCarId(active.id)
  }, [carsQuery.data, defaultCarId, selectedCarId])

  // Дефолтный пробег — последний из ClientCar (если есть и больше 0).
  useEffect(() => {
    if (mileage || !carsQuery.data || selectedCarId === null) return
    const car = carsQuery.data.find((c) => c.id === selectedCarId)
    if (car?.latest_mileage_km && car.latest_mileage_km > 0) {
      setMileage(String(car.latest_mileage_km))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carsQuery.data, selectedCarId])

  // === Loading / error / гость без авто ===
  if (packageQuery.isLoading || carsQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (packageQuery.isError || !packageQuery.data) {
    return (
      <section className="container-sct py-12">
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Пакет не найден.</p>
          <Link to="/services" className="mt-4 inline-block">
            <Button variant="ghost" size="sm">К услугам</Button>
          </Link>
        </Card>
      </section>
    )
  }
  if (!carsQuery.data || carsQuery.data.length === 0) {
    return (
      <section className="container-sct py-12">
        <Card className="border-2 border-dashed border-borderLight p-10 text-center md:p-16">
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            Сначала добавьте авто
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium italic text-textSecondary">
            Чтобы записаться на сервис, в гараже должна быть хотя бы одна машина.
          </p>
          <Link to="/garage/add" className="mt-8 inline-block">
            <Button variant="dark" size="lg">Добавить авто</Button>
          </Link>
        </Card>
      </section>
    )
  }

  const pkg = packageQuery.data
  const cars = carsQuery.data
  const selectedCar = cars.find((c) => c.id === selectedCarId) ?? null
  const shortTitle = getPackageShortTitle(pkg)

  // === Переключение шагов ===
  const goNext = () => {
    setCompleted((prev) => Array.from(new Set([...prev, step])))
    if (step === 'car') setStep('branch')
    else if (step === 'branch') setStep('datetime')
    else if (step === 'datetime') setStep('confirm')
  }
  const goBack = () => {
    if (step === 'branch') setStep('car')
    else if (step === 'datetime') setStep('branch')
    else if (step === 'confirm') setStep('datetime')
  }
  const jumpTo = (s: WizardStep) => setStep(s)

  // === Валидация перехода «Далее» ===
  const canGoNext = (() => {
    if (step === 'car') return selectedCar !== null
    if (step === 'branch') return selectedBranch !== null
    if (step === 'datetime') return Boolean(selectedDate && selectedSlot)
    return false
  })()

  // === Submit ===
  const onSubmit = async () => {
    if (!packageId || !selectedCar || !selectedBranch || !selectedSlot) return
    setServerError(null)
    try {
      // Если пользователь ввёл текущий пробег — отправляем; бэк запишет
      // в историю пробега и обновит latest_mileage_km у машины.
      const mileageNum = mileage.trim() ? Number(mileage.replace(/\s/g, '')) : NaN
      const booking = await createMut.mutateAsync({
        client_car_id: selectedCar.id,
        service_package_id: packageId,
        preferred_datetime: localIsoToUtcIso(selectedSlot),
        service_station_id: selectedBranch.id,
        comment: comment.trim() || undefined,
        ...(Number.isFinite(mileageNum) && mileageNum > 0
          ? { current_mileage_km: mileageNum }
          : {}),
      })
      navigate(`/bookings/${booking.id}`, { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось создать запись.')
      setServerError(parsed.general)
    }
  }

  return (
    <section className="container-sct max-w-[1100px] py-6 md:py-8">
      <Link
        to={`/services/${packageId}`}
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        К пакету
      </Link>

      <header className="mt-3 mb-6 md:mb-8">
        <p className="text-[10px] font-900 uppercase tracking-[0.3em] text-brandBlue">
          Запись на сервис
        </p>
        <h1 className="mt-2 text-2xl font-900 uppercase italic leading-tight tracking-tight text-textPrimary md:text-4xl">
          {shortTitle}
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Основная колонка с шагами */}
        <div className="lg:col-span-8">
          <Stepper current={step} completed={completed} onJump={jumpTo} />

          <Card className="mt-6 p-5 md:p-8">
            {step === 'car' && (
              <CarStep
                cars={cars}
                selectedId={selectedCarId}
                onSelect={setSelectedCarId}
              />
            )}
            {step === 'branch' && (
              <BranchStep
                selectedId={selectedBranch?.id ?? null}
                onSelect={(s) => setSelectedBranch(s)}
              />
            )}
            {step === 'datetime' && selectedBranch && (
              <DateTimeStep
                branchId={selectedBranch.id}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onChange={(d, slot) => {
                  setSelectedDate(d)
                  setSelectedSlot(slot)
                }}
              />
            )}
            {step === 'confirm' && selectedCar && selectedBranch && selectedSlot && (
              <ConfirmStep
                car={selectedCar}
                branch={selectedBranch}
                slotIso={selectedSlot}
                packageTitle={shortTitle}
                packagePrice={formatMoney(pkg.final_price, pkg.currency)}
                mileage={mileage}
                onMileageChange={setMileage}
                comment={comment}
                onCommentChange={setComment}
              />
            )}
          </Card>

          {serverError && (
            <div className="mt-4 rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {serverError}
            </div>
          )}

          {/* Навигация шагов. На мобиле кнопки занимают всю ширину; на md+
              «Назад» слева, основное действие — справа. */}
          <div className="mt-5 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between">
            {step !== 'car' ? (
              <Button variant="ghost" onClick={goBack} fullWidth className="md:!w-auto">
                ← Назад
              </Button>
            ) : (
              <span className="hidden md:inline" />
            )}

            {step === 'confirm' ? (
              <Button
                onClick={onSubmit}
                loading={createMut.isPending}
                size="lg"
                fullWidth
                className="md:!w-auto"
              >
                Подтвердить запись
              </Button>
            ) : (
              <Button onClick={goNext} disabled={!canGoNext} fullWidth className="md:!w-auto">
                Далее →
              </Button>
            )}
          </div>
        </div>

        {/* Sticky summary справа */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <PackageSummary
              imageUrl={pkg.image_url || null}
              title={shortTitle}
              category={pkg.category.name}
              carTitle={pkg.car_title}
              price={formatMoney(pkg.final_price, pkg.currency)}
            />

            <div className="rounded-sct border border-blue-100 bg-blue-50/40 p-4 text-[11px] font-medium italic leading-relaxed text-brandBlueDark">
              ℹ️ Время — желаемое. Мастер свяжется с вами для подтверждения слота.
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

function CarStep({
  cars,
  selectedId,
  onSelect,
}: {
  cars: ClientGarageCar[]
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
        Выберите автомобиль
      </h2>
      <p className="mb-5 text-sm font-medium text-textSecondary">
        Под какую машину готовим сервис.
      </p>

      <div className="space-y-3">
        {cars.map((car) => {
          const isSelected = car.id === selectedId
          return (
            <button
              key={car.id}
              type="button"
              onClick={() => onSelect(car.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-sct border bg-white p-4 text-left transition-all',
                isSelected
                  ? 'border-brandBlue shadow-soft-blue'
                  : 'border-borderLight hover:border-brandBlue/40',
              )}
            >
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-borderLight bg-surfaceLight">
                <SafeImage
                  src={undefined}
                  alt={car.display_name}
                  className="h-full w-full object-cover"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-900 uppercase italic text-borderLight">
                      авто
                    </div>
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-900 uppercase italic tracking-tight text-textPrimary">
                  {car.nickname || car.display_name}
                </p>
                {car.license_plate && (
                  <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-textSecondary">
                    {car.license_plate}
                    {car.is_default && <span className="ml-2 text-brandBlue">· активное</span>}
                  </p>
                )}
              </div>
              {isSelected && (
                <svg className="h-5 w-5 text-brandBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ConfirmStep({
  car,
  branch,
  slotIso,
  packageTitle,
  packagePrice,
  mileage,
  onMileageChange,
  comment,
  onCommentChange,
}: {
  car: ClientGarageCar
  branch: ServiceStation
  slotIso: string
  packageTitle: string
  packagePrice: string
  mileage: string
  onMileageChange: (v: string) => void
  comment: string
  onCommentChange: (v: string) => void
}) {
  return (
    <div>
      <h2 className="mb-1 text-xl font-900 uppercase italic tracking-tight text-textPrimary md:text-2xl">
        Проверьте запись
      </h2>
      <p className="mb-5 text-sm font-medium text-textSecondary">
        Убедитесь, что машина, филиал и время указаны верно.
      </p>

      <div className="space-y-3 rounded-sct border border-borderLight bg-surfaceLight/40 p-4 md:p-5">
        <SummaryRow label="Услуга" value={packageTitle} accent />
        <SummaryRow
          label="Автомобиль"
          value={`${car.nickname || car.display_name}${car.license_plate ? ` · ${car.license_plate}` : ''}`}
        />
        <SummaryRow label="Филиал" value={branch.name} />
        <SummaryRow label="Адрес" value={`${branch.city}, ${branch.address}`} />
        <SummaryRow label="Дата и время" value={formatDateTime(slotIso)} accent />
        <SummaryRow label="Стоимость" value={packagePrice} accent />
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-[11px] font-800 uppercase tracking-widest text-textSecondary">
            Текущий пробег, км
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder={
              car.latest_mileage_km && car.latest_mileage_km > 0
                ? String(car.latest_mileage_km)
                : '84 200'
            }
            value={mileage}
            onChange={(e) => onMileageChange(e.target.value.replace(/[^\d]/g, ''))}
            className="h-12 w-full rounded-sct border border-borderLight bg-surfaceLight px-4 text-sm font-medium text-textPrimary outline-none transition-all focus:border-brandBlue focus:bg-white focus:ring-2 focus:ring-brandBlue/15"
          />
          <p className="mt-1.5 text-[11px] text-textSecondary/70">
            Если укажете — обновим пробег в гараже и пересчитаем рекомендации сервиса.
          </p>
        </div>

        <Textarea
          label="Комментарий к визиту"
          rows={3}
          placeholder="Например: проверить шум подвески, подготовить расходники заранее."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 text-sm md:flex-row md:items-center md:justify-between md:gap-3">
      <span className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">{label}</span>
      <span
        className={cn(
          'text-right',
          accent ? 'font-900 italic text-brandBlue md:text-base' : 'font-bold text-textPrimary',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function PackageSummary({
  imageUrl,
  title,
  category,
  carTitle,
  price,
}: {
  imageUrl: string | null
  title: string
  category: string
  carTitle: string
  price: string
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex gap-3 p-4">
        <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sct border border-borderLight bg-surfaceLight">
          <SafeImage
            src={imageUrl ?? undefined}
            alt={title}
            className="h-full w-full object-cover"
            fallback={<div className="flex h-full w-full items-center justify-center text-2xl">🛠️</div>}
          />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-900 uppercase tracking-widest text-textSecondary">
            {category}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm font-900 uppercase italic leading-tight text-textPrimary">
            {title}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-textSecondary">
            {carTitle}
          </p>
        </div>
      </div>
      <div className="border-t border-borderLight bg-surfaceLight/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
            К оплате
          </span>
          <span className="text-xl font-900 italic tracking-tighter text-brandBlue">
            {price}
          </span>
        </div>
      </div>
    </Card>
  )
}
