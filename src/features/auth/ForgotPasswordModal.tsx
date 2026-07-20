/**
 * Восстановление пароля по SMS — новый флоу бэка (2 экрана).
 *
 *   Шаг 1 (phone) — ввод телефона → POST /password-reset/request/.
 *                   Бэк ВСЕГДА отвечает одинаково (даже если номера нет),
 *                   поэтому безопасно всегда показываем «если номер есть —
 *                   мы отправили SMS» и идём дальше.
 *   Шаг 2 (reset) — код из SMS + новый пароль + подтверждение →
 *                   POST /password-reset/confirm/.
 *   Шаг 3 (done)  — «Пароль успешно изменён» и автопереход на экран входа.
 *                   Автоматический вход НЕ выполняем (по требованию бэка).
 *
 * На демо реальные SMS не шлются — код всегда `8888`.
 */
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Button } from '@/shared/ui/Button'
import { parseApiError } from './errors'
import { confirmPasswordReset, requestPasswordReset } from './password-reset-api'
import { codeRules, passwordRules } from './schemas'
import { formatPhoneInput, unformatPhone } from '@/shared/lib/phone'

type Step = 'phone' | 'reset' | 'done'

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
  onBackToLogin: () => void
}

const ERROR_BOX =
  'rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700'

// — schemas —
const phoneRegex = /^\+?[0-9\s\-()]{7,32}$/
const phoneSchema = z.object({
  phone: z.string().min(1, 'Введите номер телефона').regex(phoneRegex, 'Неверный формат телефона'),
})
type PhoneValues = z.infer<typeof phoneSchema>

const resetSchema = z
  .object({
    code: codeRules,
    password: passwordRules,
    password_confirm: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Пароли не совпадают',
    path: ['password_confirm'],
  })
type ResetValues = z.infer<typeof resetSchema>

export function ForgotPasswordModal({
  open,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('') // нормализованный (+7XXXXXXXXXX)

  const close = () => {
    onClose()
    setTimeout(() => {
      setStep('phone')
      setPhone('')
    }, 200)
  }

  return (
    <Modal open={open} onClose={close} size="sm">
      <h2 className="mb-1.5 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Восстановление пароля
      </h2>

      {step === 'phone' && (
        <PhoneStep
          onSuccess={(normalizedPhone) => {
            setPhone(normalizedPhone)
            setStep('reset')
          }}
          onBackToLogin={onBackToLogin}
        />
      )}
      {step === 'reset' && (
        <ResetStep phone={phone} onSuccess={() => setStep('done')} onBackToLogin={onBackToLogin} />
      )}
      {step === 'done' && <DoneStep onBackToLogin={onBackToLogin} />}
    </Modal>
  )
}

// === Шаг 1: телефон ===
function PhoneStep({
  onSuccess,
  onBackToLogin,
}: {
  onSuccess: (normalizedPhone: string) => void
  onBackToLogin: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  })

  const onSubmit = async (values: PhoneValues) => {
    setServerError(null)
    const normalized = unformatPhone(values.phone)
    try {
      await requestPasswordReset({ phone: normalized })
      // Бэк отвечает одинаково независимо от существования номера — всегда идём дальше.
      onSuccess(normalized)
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось отправить код. Попробуйте позже.')
      if (parsed.fields.phone) setError('phone', { type: 'server', message: parsed.fields.phone })
      else setServerError(parsed.general ?? 'Не удалось отправить код. Попробуйте позже.')
    }
  }

  return (
    <>
      <p className="mb-6 text-center text-sm text-textSecondary">
        Введите ваш номер телефона — отправим на него проверочный SMS-код.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneInput
              label="Номер телефона"
              value={field.value}
              onChange={field.onChange}
              error={errors.phone?.message}
            />
          )}
        />

        {serverError && <div className={ERROR_BOX}>{serverError}</div>}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Получить код
        </Button>

        <BackToLogin onBackToLogin={onBackToLogin} />
      </form>
    </>
  )
}

// === Шаг 2: код + новый пароль ===
function ResetStep({
  phone,
  onSuccess,
  onBackToLogin,
}: {
  phone: string
  onSuccess: () => void
  onBackToLogin: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: '', password: '', password_confirm: '' },
  })

  const onSubmit = async (values: ResetValues) => {
    setServerError(null)
    try {
      await confirmPasswordReset({
        phone,
        code: values.code,
        new_password: values.password,
      })
      onSuccess()
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось изменить пароль.')
      if (parsed.fields.code) setError('code', { type: 'server', message: parsed.fields.code })
      if (parsed.fields.new_password)
        setError('password', { type: 'server', message: parsed.fields.new_password })
      if (parsed.fields.password)
        setError('password', { type: 'server', message: parsed.fields.password })
      const mapped = parsed.fields.code || parsed.fields.new_password || parsed.fields.password
      if (parsed.general || !mapped) {
        setServerError(parsed.general ?? 'Не удалось изменить пароль.')
      }
    }
  }

  return (
    <>
      <p className="mb-6 text-center text-sm text-textSecondary">
        Если такой номер существует, мы отправили SMS на{' '}
        <span className="font-bold text-textPrimary">{formatPhoneInput(phone)}</span>. Введите код и
        новый пароль.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Код из SMS"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={8}
          {...register('code')}
          error={errors.code?.message}
        />
        <Input
          label="Новый пароль"
          type="password"
          autoComplete="new-password"
          hint="Минимум 8 символов, буква и цифра"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label="Повторите новый пароль"
          type="password"
          autoComplete="new-password"
          {...register('password_confirm')}
          error={errors.password_confirm?.message}
        />

        {serverError && <div className={ERROR_BOX}>{serverError}</div>}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Сменить пароль
        </Button>

        <BackToLogin onBackToLogin={onBackToLogin} />
      </form>
    </>
  )
}

// === Шаг 3: успех ===
function DoneStep({ onBackToLogin }: { onBackToLogin: () => void }) {
  // Автоматически переходим на экран входа (вход НЕ выполняем — по требованию бэка).
  useEffect(() => {
    const id = setTimeout(onBackToLogin, 2200)
    return () => clearTimeout(id)
  }, [onBackToLogin])

  return (
    <div className="space-y-5 pt-2 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-successBg text-successText">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <p className="text-lg font-900 uppercase tracking-tight text-textPrimary">
          Пароль успешно изменён
        </p>
        <p className="mt-1 text-sm text-textSecondary">Сейчас откроется экран входа…</p>
      </div>
      <Button onClick={onBackToLogin} fullWidth size="lg">
        Перейти ко входу
      </Button>
    </div>
  )
}

// — helper —
function BackToLogin({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onBackToLogin}
        className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
      >
        Вернуться на вход
      </button>
    </div>
  )
}
