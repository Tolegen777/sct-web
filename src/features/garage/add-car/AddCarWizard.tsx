/**
 * Главный компонент-обёртка над всеми шагами конфигуратора.
 *
 * Хранит выбор пользователя в локальном state, координирует переходы между
 * шагами, на финальном — отправляет POST /garage/cars/.
 *
 * Шаги нумеруются 0..4. maxUnlockedIndex = индекс самого правого открытого
 * шага. Назад можно ходить всегда, вперёд — только через кнопку «Далее» или
 * сразу при выборе значения (для grid-шагов).
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper, type StepDef } from './Stepper'
import { MarkStep } from './MarkStep'
import { ModelStep } from './ModelStep'
import { SpecsStep, type SpecsValues } from './SpecsStep'
import { ModificationStep } from './ModificationStep'
import { FinalFormStep } from './FinalFormStep'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { useCreateCarMutation } from '@/features/garage/queries'
import { parseApiError } from '@/features/auth/errors'
import type { Mark, Model, Modification } from './types'

const STEPS: StepDef[] = [
  { id: 'mark', title: 'Марка' },
  { id: 'model', title: 'Модель' },
  { id: 'specs', title: 'Поколение' },
  { id: 'modification', title: 'Характеристики' },
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
  const [modPage, setModPage] = useState(1)
  const [serverError, setServerError] = useState<string | null>(null)

  // Самый правый открытый шаг — определяется наличием данных.
  const maxUnlocked =
    !mark ? 0 : !model ? 1 : !modification ? 3 : 4

  const goTo = (index: number) => {
    if (index <= maxUnlocked) setActiveIndex(index)
  }

  const onMarkSelected = (m: Mark) => {
    // При смене марки сбрасываем всё ниже.
    if (mark?.id !== m.id) {
      setModel(null)
      setSpecs({})
      setModification(null)
      setModPage(1)
    }
    setMark(m)
    setActiveIndex(1)
  }

  const onModelSelected = (m: Model) => {
    if (model?.id !== m.id) {
      setSpecs({})
      setModification(null)
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
    setModPage(1)
  }

  const onModificationSelected = (mod: Modification) => {
    setModification(mod)
    setActiveIndex(4)
  }

  const submit = async (values: {
    license_plate: string
    nickname: string
    vin_code: string
    mileage_km: number | null
    is_default: boolean
  }) => {
    if (!modification) return
    setServerError(null)
    try {
      await createCar.mutateAsync({
        modification_source_id: modification.source_id,
        license_plate: values.license_plate,
        nickname: values.nickname,
        vin_code: values.vin_code,
        mileage_km: values.mileage_km,
        is_default: values.is_default,
      })
      navigate('/garage', { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось сохранить автомобиль.')
      const allMessages = [
        parsed.general,
        ...Object.values(parsed.fields),
      ].filter(Boolean) as string[]
      setServerError(allMessages.join(' ') || 'Не удалось сохранить автомобиль.')
    }
  }

  return (
    <div className="space-y-8">
      <Stepper
        steps={STEPS}
        activeIndex={activeIndex}
        maxUnlockedIndex={maxUnlocked}
        onSelect={goTo}
      />

      <Card className="p-6 md:p-10">
        {activeIndex === 0 && (
          <MarkStep
            selectedMarkId={mark?.id ?? null}
            onSelect={onMarkSelected}
          />
        )}

        {activeIndex === 1 && mark && (
          <ModelStep
            mark={mark}
            selectedModelId={model?.id ?? null}
            onSelect={onModelSelected}
          />
        )}

        {activeIndex === 2 && mark && model && (
          <>
            <SpecsStep
              markId={mark.id}
              markLabel={mark.display_name}
              modelId={model.id}
              modelLabel={model.name}
              values={specs}
              onChange={onSpecsChange}
            />
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setActiveIndex(3)}>Далее</Button>
            </div>
          </>
        )}

        {activeIndex === 3 && mark && model && (
          <ModificationStep
            markId={mark.id}
            modelId={model.id}
            specs={specs}
            selectedSourceId={modification?.source_id ?? null}
            onSelect={onModificationSelected}
            page={modPage}
            onPageChange={setModPage}
          />
        )}

        {activeIndex === 4 && mark && model && modification && (
          <FinalFormStep
            mark={mark}
            model={model}
            specs={specs}
            modification={modification}
            defaultIsDefault={true}
            onSubmit={submit}
            serverError={serverError}
          />
        )}
      </Card>

      {activeIndex > 0 && (
        <div className="flex justify-start">
          <Button variant="ghost" onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}>
            ← Назад
          </Button>
        </div>
      )}
    </div>
  )
}
