/**
 * Шаг 5: финальная форма. Госномер, VIN, псевдоним, пробег, флаг «активный».
 *
 * Валидация привязана к patterns из OpenAPI schema:
 *   - license_plate: ^[A-ZА-Я0-9\-\s]{2,32}$
 *   - vin_code:      ^[A-HJ-NPR-Z0-9]{0,17}$  (max 17, без I/O/Q)
 *   - mileage_km:    >= 1, целое
 *
 * Бэк может валидировать строже (например, VIN на checksum — пока не делает,
 * подтвердил ПМ). Мы делаем базовую проверку, остальное доверим серверу.
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
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
  mileage_km: z
    .string()
    .refine((v) => v === '' || /^\d+$/.test(v), 'Пробег — только цифры')
    .refine((v) => v === '' || Number(v) >= 1, 'Пробег должен быть не меньше 1'),
  is_default: z.boolean(),
})

export type FinalFormValues = z.infer<typeof finalSchema>

interface FinalFormStepProps {
  mark: Mark
  model: Model
  specs: SpecsValues
  modification: Modification
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
  mark,
  model,
  modification,
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
      vin_code: '',
      mileage_km: '',
      is_default: defaultIsDefault,
    },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      license_plate: values.license_plate.trim().toUpperCase(),
      nickname: values.nickname?.trim() ?? '',
      vin_code: values.vin_code?.trim().toUpperCase() ?? '',
      mileage_km: values.mileage_km ? Number(values.mileage_km) : null,
      is_default: values.is_default,
    })
  })

  const fullTitle =
    (typeof modification.display_name === 'string' && modification.display_name) ||
    `${mark.display_name} ${model.name}`

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
      <form className="space-y-5 md:col-span-7" onSubmit={submit}>
        <header>
          <h2 className="text-2xl font-900 uppercase italic tracking-tight text-textPrimary md:text-3xl">
            Данные автомобиля
          </h2>
          <p className="mt-2 text-sm text-textSecondary">
            Заполните основное. Псевдоним, VIN и пробег — по желанию, но это
            помогает вести сервисную книжку.
          </p>
        </header>

        <Input
          label="Госномер *"
          placeholder="777 ABC 01"
          autoComplete="off"
          {...register('license_plate')}
          error={errors.license_plate?.message}
        />
        <Input
          label="Псевдоним"
          placeholder="Моя машина"
          autoComplete="off"
          hint="Будет отображаться в списке гаража"
          {...register('nickname')}
          error={errors.nickname?.message}
        />
        <Input
          label="VIN-код"
          placeholder="JTDBR32E720000001"
          autoComplete="off"
          maxLength={17}
          {...register('vin_code')}
          error={errors.vin_code?.message}
        />
        <Input
          label="Пробег, км"
          placeholder="85000"
          inputMode="numeric"
          {...register('mileage_km')}
          error={errors.mileage_km?.message}
        />

        <label className="flex items-center gap-3 rounded-sct border border-borderLight bg-surfaceLight p-4 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-borderLight text-brandBlue focus:ring-brandBlue/30"
            {...register('is_default')}
          />
          <span className="text-sm font-bold text-textPrimary">
            Сделать этот автомобиль активным
          </span>
        </label>

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Сохранить автомобиль
        </Button>
      </form>

      <aside className="md:col-span-5">
        <div className="sticky top-24 rounded-sct-lg border border-borderLight bg-surfaceLight p-6">
          <p className="text-[10px] font-900 uppercase tracking-[0.2em] text-brandBlue">
            Выбранная конфигурация
          </p>
          <p className="mt-3 text-xl font-900 uppercase italic tracking-tight text-textPrimary">
            {fullTitle}
          </p>
          {(modification.year_from || modification.year_to) && (
            <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-textSecondary">
              {modification.year_from ?? ''}{modification.year_to ? ` – ${modification.year_to}` : ''}
            </p>
          )}
          <div className="mt-4 rounded-sct border border-borderLight bg-white p-3 font-mono text-[10px] text-textSecondary break-all">
            source_id: {modification.source_id}
          </div>
        </div>
      </aside>
    </div>
  )
}
