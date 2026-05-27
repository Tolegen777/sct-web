/**
 * Схемы валидации форм авторизации (zod).
 *
 * Все patterns соответствуют OpenAPI schema:
 *  - phone:    ^\+?[0-9\s\-\(\)]{7,32}$
 *  - vin_code: ^[A-HJ-NPR-Z0-9]{0,17}$
 *  - license_plate: ^[A-ZА-Я0-9\-\s]{2,32}$
 *
 * Все строки перед отправкой нормализуем (trim, нижний регистр для phone и
 * VIN не нужен — бэк сам обработает).
 */
import { z } from 'zod'

const phoneRegex = /^\+?[0-9\s\-()]{7,32}$/

/**
 * Пароль — правила синхронизированы со стандартными Django-валидаторами:
 *   - минимум 8 символов (MinimumLengthValidator)
 *   - не только цифры (NumericPasswordValidator)
 *   - содержит хотя бы одну букву + одну цифру (отсеивает 90% common-паролей)
 *   - содержит хотя бы одну заглавную ИЛИ спецсимвол (доп. защита)
 *
 * NB: Django также делает UserAttributeSimilarityValidator (похожесть на
 * имя/телефон/email) и CommonPasswordValidator (20k common-паролей). Эти
 * две проверки можно сделать только на бэке — мы их не воспроизводим.
 * Если бэк отвергнет — переведённое сообщение покажем в красной плашке.
 */
const passwordRules = z
  .string()
  .min(8, 'Пароль должен быть не короче 8 символов')
  .refine((v) => /[a-zA-Zа-яА-ЯёЁ]/.test(v), {
    message: 'Пароль должен содержать хотя бы одну букву',
  })
  .refine((v) => /\d/.test(v), {
    message: 'Пароль должен содержать хотя бы одну цифру',
  })
  .refine((v) => !/^\d+$/.test(v), {
    message: 'Пароль не может состоять только из цифр',
  })
  .refine(
    (v) => /[A-ZА-ЯЁ]/.test(v) || /[^A-Za-zА-Яа-яЁё0-9]/.test(v),
    {
      message: 'Добавьте заглавную букву или спецсимвол (!@#$ и т.п.)',
    },
  )

export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Введите номер телефона')
    .regex(phoneRegex, 'Неверный формат телефона'),
  password: z.string().min(1, 'Введите пароль'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

/**
 * В обновлённом дизайне поле для имени одно — без split на имя/фамилию.
 * Бэк всё ещё ждёт first_name (required) + last_name (optional). На submit
 * разбиваем `full_name` по первому пробелу: всё до пробела → first_name,
 * остаток → last_name.
 */
export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Введите имя')
      .max(300, 'Слишком длинное имя'),
    phone: z
      .string()
      .min(1, 'Введите номер телефона')
      .regex(phoneRegex, 'Неверный формат телефона'),
    password: passwordRules,
    password_confirm: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Пароли не совпадают',
    path: ['password_confirm'],
  })
export type RegisterFormValues = z.infer<typeof registerSchema>

/**
 * Разбивает одну строку «Имя [Фамилия]» в пару {first_name, last_name}.
 * Дизайн использует одно поле, а бэк хочет два — split по первому пробелу.
 */
export function splitFullName(fullName: string): {
  first_name: string
  last_name: string
} {
  const trimmed = fullName.trim().replace(/\s+/g, ' ')
  const idx = trimmed.indexOf(' ')
  if (idx === -1) return { first_name: trimmed, last_name: '' }
  return {
    first_name: trimmed.slice(0, idx),
    last_name: trimmed.slice(idx + 1),
  }
}
