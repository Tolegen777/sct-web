/**
 * Главный компонент-обёртка над всеми шагами конфигуратора.
 *
 * Хранит выбор пользователя в локальном state, координирует переходы между
 * шагами, на финальном — отправляет POST /garage/cars/.
 *
 * Layout по дизайну new_screens: верхняя панель (табы шагов + кнопка
 * «Ввести VIN код» + прогресс), ниже — две колонки: слева карточка текущего
 * шага, справа сайдбар «Конфигурация». VIN вводится опционально заранее
 * (модалка на desktop, инлайн-поле на mobile) и подставляется в финальную форму.
 *
 * Шаги нумеруются 0..4. maxUnlockedIndex = индекс самого правого открытого
 * шага. Назад можно ходить всегда, вперёд — только через «Далее» или сразу
 * при выборе значения (для grid-шагов).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper, type StepDef } from './Stepper'
import { ConfigSidebar } from './ConfigSidebar'
import { MarkStep } from './MarkStep'
import { ModelStep } from './ModelStep'
import { SpecsStep, type SpecsValues } from './SpecsStep'
import { ModificationStep } from './ModificationStep'
import { TrimStep } from './TrimStep'
import { FinalFormStep } from './FinalFormStep'
import { Card } from '@/shared/ui/Card'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { useCreateCarMutation } from '@/features/garage/queries'
import { parseApiError } from '@/features/auth/errors'
import type { Mark, Model, Modification, Trim } from './types'

const STEPS: StepDef[] = [
  { id: 'mark', title: 'Марка' },
  { id: 'model', title: 'Модель' },
  { id: 'specs', title: 'Поколение' },
  { id: 'modification', title: 'Характеристики' },
  { id: 'trim', title: 'Комплектация' },
  { id: 'final', title: 'Номер' },
]

export function AddCarWizard() {
  const navigate = useNavigate()
  const createCar = useCreateCarMutation()

  const [activeIndex, setActiveIndex] = useState(0)
  const [mark, setMark] = useState<Mark | null>(null)
  const [model, setModel] = useState<Model | null>(null)
  const [specs, setSpecs] = useState<SpecsValues>({})
  const [modification, setModification] = useState<Modification | null>(null)
  const [trim, setTrim] = useState<Trim | null>(null)
  const [bodyLabel, setBodyLabel] = useState<string | null>(null)
  const [modPage, setModPage] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)

  // VIN — опциональный, вводится заранее, подставляется в финальную форму.
  const [vin, setVin] = useState('')
  const [vinDraft, setVinDraft] = useState('')
  const [vinOpen, setVinOpen] = useState(false)

  // Самый правый открытый шаг — определяется наличием данных.
  // 0 марка · 1 модель · 2 поколение · 3 характеристики · 4 комплектация · 5 номер.
  const maxUnlocked = !mark ? 0 : !model ? 1 : !modification ? 3 : !trim ? 4 : 5

  // Если у модификации одна комплектация — шаг «Комплектация» проскакивается
  // (TrimStep сам выбирает её). Чтобы «назад» не залипало на этом шаге.
  const singleTrim = modification?.trims_count === 1

  const goTo = (index: number) => {
    if (index <= maxUnlocked) setActiveIndex(index)
  }

  const onBack = () => {
    // С «Номера» при единственной комплектации прыгаем сразу на «Характеристики».
    if (activeIndex === 5 && singleTrim) {
      setActiveIndex(3)
      return
    }
    if (activeIndex > 0) setActiveIndex((i) => Math.max(0, i - 1))
    else navigate('/garage')
  }

  const onMarkSelected = (m: Mark) => {
    // При смене марки сбрасываем всё ниже.
    if (mark?.id !== m.id) {
      setModel(null)
      setSpecs({})
      setModification(null)
      setTrim(null)
      setBodyLabel(null)
      setModPage(1)
    }
    setMark(m)
    setActiveIndex(1)
  }

  const onModelSelected = (m: Model) => {
    if (model?.id !== m.id) {
      setSpecs({})
      setModification(null)
      setTrim(null)
      setBodyLabel(null)
      setModPage(1)
    }
    setModel(m)
    setActiveIndex(2)
  }

  const onSpecsChange = (next: SpecsValues) => {
    // При смене параметров скидываем выбранную модификацию — она может уже
    // не подходить под новые фильтры.
    setSpecs(next)
    setModification(null)
    setTrim(null)
    setModPage(1)
  }

  // Выбор модификации только подсвечивает её; переход на шаг «Комплектация» —
  // по кнопке «Далее» (confirmModification).
  const onModificationSelected = (mod: Modification) => {
    if (modification?.id !== mod.id) setTrim(null)
    setModification(mod)
  }

  const confirmModification = () => {
    if (modification) setActiveIndex(4)
  }

  // Выбор комплектации (или авто-выбор единственной) → финальный шаг «Номер».
  const onTrimSelected = (t: Trim) => {
    setTrim(t)
    setActiveIndex(5)
  }

  const submit = async (values: {
    license_plate: string
    nickname: string
    vin_code: string
    mileage_km: number | null
    is_default: boolean
  }) => {
    if (!trim) return
    setServerError(null)
    try {
      await createCar.mutateAsync({
        modification_trim_source_id: trim.source_id,
        license_plate: values.license_plate,
        nickname: values.nickname,
        vin_code: values.vin_code,
        mileage_km: values.mileage_km,
        is_default: values.is_default,
      })
      navigate('/garage', { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось сохранить автомобиль.')
      const allMessages = [parsed.general, ...Object.values(parsed.fields)].filter(
        Boolean,
      ) as string[]
      setServerError(allMessages.join(' ') || 'Не удалось сохранить автомобиль.')
    }
  }

  return (
    <div className="space-y-6">
      <Stepper
        steps={STEPS}
        activeIndex={activeIndex}
        maxUnlockedIndex={maxUnlocked}
        onSelect={goTo}
        onBack={onBack}
        onVinClick={() => {
          setVinDraft(vin)
          setVinOpen(true)
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8">
            {/* На мобиле VIN-поле инлайном на первом шаге (на desktop — модалка) */}
            {activeIndex === 0 && (
              <div className="mb-6 lg:hidden">
                <Input
                  label="Введите VIN код (необязательно)"
                  placeholder="VIN код"
                  maxLength={17}
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                />
              </div>
            )}

            {activeIndex === 0 && (
              <MarkStep selectedMarkId={mark?.id ?? null} onSelect={onMarkSelected} />
            )}

            {activeIndex === 1 && mark && (
              <ModelStep
                mark={mark}
                selectedModelId={model?.id ?? null}
                onSelect={onModelSelected}
              />
            )}

            {activeIndex === 2 && mark && model && (
              <SpecsStep
                markId={mark.id}
                markLabel={mark.display_name}
                modelId={model.id}
                modelLabel={model.name}
                values={specs}
                onChange={onSpecsChange}
                onBodyLabel={setBodyLabel}
                onNext={() => setActiveIndex(3)}
              />
            )}

            {activeIndex === 3 && mark && model && (
              <ModificationStep
                markId={mark.id}
                modelId={model.id}
                specs={specs}
                onSpecsChange={onSpecsChange}
                selectedModId={modification?.id ?? null}
                onSelect={onModificationSelected}
                onConfirm={confirmModification}
                page={modPage}
                onPageChange={setModPage}
              />
            )}

            {activeIndex === 4 && modification && (
              <TrimStep
                modificationId={modification.id}
                selectedTrimSourceId={trim?.source_id ?? null}
                onSelect={onTrimSelected}
              />
            )}

            {activeIndex === 5 && mark && model && modification && trim && (
              <FinalFormStep
                mark={mark}
                model={model}
                specs={specs}
                modification={modification}
                defaultVin={vin}
                defaultIsDefault={true}
                onSubmit={submit}
                serverError={serverError}
              />
            )}
          </Card>
        </div>

        {/* Сайдбар «Конфигурация» — только desktop. В мобильном макете
            (screens/add-car) его нет: после карточки шага идёт сразу футер. */}
        <aside className="hidden lg:col-span-4 lg:block">
          <ConfigSidebar
            mark={mark}
            model={model}
            specs={specs}
            modification={modification}
            bodyLabel={bodyLabel}
          />
        </aside>
      </div>

      <Modal open={vinOpen} onClose={() => setVinOpen(false)} size="sm">
        <h2 className="mb-6 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
          VIN код
        </h2>
        <Input
          label="Введите VIN код (необязательно)"
          placeholder="VIN код"
          maxLength={17}
          value={vinDraft}
          onChange={(e) => setVinDraft(e.target.value.toUpperCase())}
        />
        <button
          type="button"
          onClick={() => {
            setVin(vinDraft)
            setVinOpen(false)
          }}
          className="mt-5 w-full rounded-sct bg-brandBlue py-3.5 text-[12px] font-900 uppercase tracking-widest text-white shadow-soft-blue transition-all hover:bg-brandBlueDark"
        >
          Подтвердить
        </button>
      </Modal>
    </div>
  )
}
