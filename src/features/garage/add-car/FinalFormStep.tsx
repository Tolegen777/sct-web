/**
 * Шаг 5 «Номер» (по дизайну new_screens): «Почти готово».
 *
 * Центрированная форма: Госномер (обязательно), Псевдоним (необязательно),
 * VIN (необязательно, подставляется из заранее введённого). Кнопка
 * «Добавить в гараж». Итоговая конфигурация показана в сайдбаре визарда,
 * поэтому правого summary-блока здесь нет.
 *
 * Поля «пробег» и «сделать активным» по дизайну убраны: пробег вводится
 * позже через редактирование авто, новое авто становится активным по умолчанию.
 *
 * Валидация привязана к patterns из OpenAPI:
 *   - license_plate: ^[A-ZА-Я0-9\-\s]{2,32}$
 *   - vin_code:      ^[A-HJ-NPR-Z0-9]{0,17}$ (max 17, без I/O/Q)
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/ui/Input'
import type { Mark, Model, Modification } from './types'
import type { SpecsValues } from './SpecsStep'

const licensePlateRegex = /^[A-ZА-ЯЁ0-9\-\s]{2,32}$/i
const vinRegex = /^[A-HJ-NPR-Z0-9]{0,17}$/

const finalSchema = z.object({
  license_plate: z
    .string()
    .min(2, 'Минимум 2 символа')
    .max(32, 'Максимум 32 символа')
    .regex(licensePlateRegex, 'Только латинские/кириллические буквы, цифры, дефис'),
  nickname: z.string().max(255, 'Максимум 255 символов').optional().or(z.literal('')),
  vin_code: z
    .string()
    .regex(vinRegex, 'VIN — только латиница (без I, O, Q) и цифры')
    .max(17, 'VIN не больше 17 символов')
    .optional()
    .or(z.literal('')),
})

export type FinalFormValues = z.infer<typeof finalSchema>

interface FinalFormStepProps {
  mark: Mark
  model: Model
  specs: SpecsValues
  modification: Modification
  defaultVin?: string
  defaultIsDefault: boolean
  onSubmit: (values: {
    license_plate: string
    nickname: string
    vin_code: string
    mileage_km: number | null
    is_default: boolean
  }) => Promise<void>
  serverError: string | null
}

export function FinalFormStep({
  defaultVin = '',
  defaultIsDefault,
  onSubmit,
  serverError,
}: FinalFormStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FinalFormValues>({
    resolver: zodResolver(finalSchema),
    defaultValues: {
      license_plate: '',
      nickname: '',
      vin_code: defaultVin,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      license_plate: values.license_plate.trim().toUpperCase(),
      nickname: values.nickname?.trim() ?? '',
      vin_code: values.vin_code?.trim().toUpperCase() ?? '',
      mileage_km: null,
      is_default: defaultIsDefault,
    })
  })

  return (
    <form className="mx-auto max-w-md py-2" onSubmit={submit}>
      <h2 className="text-center text-2xl font-900 uppercase tracking-tight text-textPrimary md:text-3xl">
        Почти готово
      </h2>
      <p className="mt-2 text-center text-sm text-textSecondary">
        Введите данные для регистрации в системе
      </p>

      <div className="mt-8 space-y-5">
        <Input
          label="Госномер (обязательно)"
          placeholder="000 AAA 01"
          autoComplete="off"
          className="text-center text-lg font-900 uppercase tracking-[0.25em] placeholder:tracking-[0.25em]"
          {...register('license_plate')}
          error={errors.license_plate?.message}
        />
        <Input
          label="Псевдоним авто (необязательно)"
          placeholder="Напр: Моя машина"
          autoComplete="off"
          {...register('nickname')}
          error={errors.nickname?.message}
        />
        <Input
          label="Введите VIN код (необязательно)"
          placeholder="VIN код"
          autoComplete="off"
          maxLength={17}
          {...register('vin_code')}
          error={errors.vin_code?.message}
        />
      </div>

      {serverError && (
        <div className="mt-5 rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded-sct bg-brandBlue py-4 text-sm font-900 uppercase tracking-[0.15em] text-white shadow-soft-blue transition-all hover:bg-brandBlueDark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Сохраняем…' : 'Добавить в гараж'}
      </button>
    </form>
  )
}
