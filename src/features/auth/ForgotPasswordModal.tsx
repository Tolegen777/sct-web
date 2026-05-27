/**
 * 3-шаговая модалка восстановления пароля.
 *
 * Шаги:
 *   1. Phone   — ввод телефона → POST /password-reset/request/
 *                Возвращает request_id (храним в state).
 *   2. Code    — ввод SMS-кода → POST /password-reset/verify/
 *                Возвращает reset_token.
 *   3. NewPass — новый пароль + подтверждение → POST /password-reset/confirm/
 *                Возвращает access+refresh; залогиниваем пользователя.
 *
 * API на бэке ещё не реализован (см. BACKEND_NOTES). При попытке submit
 * приходит 404 — мы покажем понятное сообщение «Эндпоинт ещё в работе».
 *
 * Ссылка «Вернуться на вход» работает на каждом шаге — переключает на
 * `?modal=login` через `onBackToLogin`.
 */
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from './store'
import { parseApiError } from './errors'
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordReset,
} from './password-reset-api'
import { fetchClientProfile } from './api'
import { unformatPhone } from '@/shared/lib/phone'

type Step = 'phone' | 'code' | 'new-password'

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
  onBackToLogin: () => void
}

// — schemas —
const phoneRegex = /^\+?[0-9\s\-()]{7,32}$/

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Введите номер телефона')
    .regex(phoneRegex, 'Неверный формат телефона'),
})
type PhoneValues = z.infer<typeof phoneSchema>

const codeSchema = z.object({
  code: z
    .string()
    .min(4, 'Слишком короткий код')
    .max(8, 'Слишком длинный код')
    .regex(/^\d+$/, 'Код состоит только из цифр'),
})
type CodeValues = z.infer<typeof codeSchema>

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Пароль должен быть не короче 8 символов')
      .refine((v) => /[a-zA-Zа-яА-ЯёЁ]/.test(v), {
        message: 'Должна быть хотя бы одна буква',
      })
      .refine((v) => /\d/.test(v), {
        message: 'Должна быть хотя бы одна цифра',
      }),
    password_confirm: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: 'Пароли не совпадают',
    path: ['password_confirm'],
  })
type NewPasswordValues = z.infer<typeof newPasswordSchema>

export function ForgotPasswordModal({
  open,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [requestId, setRequestId] = useState<string | null>(null)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const close = () => {
    onClose()
    // Сбрасываем стейт через setTimeout, чтобы при закрытии анимация
    // успела отыграть со старыми данными.
    setTimeout(() => {
      setStep('phone')
      setPhone('')
      setRequestId(null)
      setResetToken(null)
    }, 200)
  }

  return (
    <Modal open={open} onClose={close} title="Восстановление пароля" size="sm">
      {step === 'phone' && (
        <PhoneStep
          defaultPhone={phone}
          onSuccess={(p, rid) => {
            setPhone(p)
            setRequestId(rid)
            setStep('code')
          }}
          onBackToLogin={onBackToLogin}
        />
      )}
      {step === 'code' && requestId && (
        <CodeStep
          requestId={requestId}
          phone={phone}
          onSuccess={(token) => {
            setResetToken(token)
            setStep('new-password')
          }}
          onBackToLogin={onBackToLogin}
          onResendRequest={() => setStep('phone')}
        />
      )}
      {step === 'new-password' && resetToken && (
        <NewPasswordStep
          resetToken={resetToken}
          onSuccess={close}
          onBackToLogin={onBackToLogin}
        />
      )}
    </Modal>
  )
}

// === Шаг 1: телефон ===
function PhoneStep({
  defaultPhone,
  onSuccess,
  onBackToLogin,
}: {
  defaultPhone: string
  onSuccess: (phone: string, requestId: string) => void
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
    defaultValues: { phone: defaultPhone },
  })

  const onSubmit = async (values: PhoneValues) => {
    setServerError(null)
    try {
      const data = await requestPasswordReset({ phone: unformatPhone(values.phone) })
      onSuccess(values.phone, data.request_id)
    } catch (err) {
      const parsed = parseApiError(
        err,
        'Восстановление пароля ещё в работе. Пожалуйста, обратитесь в колл-центр или попробуйте позже.',
      )
      if (parsed.fields.phone) setError('phone', { type: 'server', message: parsed.fields.phone })
      else if (parsed.general) setServerError(parsed.general)
    }
  }

  return (
    <>
      <p className="-mt-2 mb-6 text-sm text-textSecondary">
        Введите номер телефона, который вы указывали при регистрации — отправим
        SMS-код.
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

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Получить SMS-код
        </Button>

        <BackToLogin onBackToLogin={onBackToLogin} />
      </form>
    </>
  )
}

// === Шаг 2: SMS-код ===
function CodeStep({
  requestId,
  phone,
  onSuccess,
  onBackToLogin,
  onResendRequest,
}: {
  requestId: string
  phone: string
  onSuccess: (resetToken: string) => void
  onBackToLogin: () => void
  onResendRequest: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  })

  const onSubmit = async (values: CodeValues) => {
    setServerError(null)
    try {
      const data = await verifyPasswordReset({
        request_id: requestId,
        code: values.code,
      })
      onSuccess(data.reset_token)
    } catch (err) {
      const parsed = parseApiError(err, 'Неверный код. Попробуйте ещё раз.')
      if (parsed.fields.code) setError('code', { type: 'server', message: parsed.fields.code })
      else if (parsed.general) setServerError(parsed.general)
    }
  }

  return (
    <>
      <p className="-mt-2 mb-6 text-sm text-textSecondary">
        Мы отправили SMS-код на <span className="font-bold text-textPrimary">{phone}</span>.
        Введите его ниже.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Введите код"
          placeholder="1234"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={8}
          {...register('code')}
          error={errors.code?.message}
        />

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Подтвердить
        </Button>

        <div className="flex justify-between text-center text-sm">
          <button
            type="button"
            onClick={onResendRequest}
            className="text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
          >
            Изменить номер
          </button>
          <BackToLoginLink onBackToLogin={onBackToLogin} />
        </div>
      </form>
    </>
  )
}

// === Шаг 3: новый пароль ===
function NewPasswordStep({
  resetToken,
  onSuccess,
  onBackToLogin,
}: {
  resetToken: string
  onSuccess: () => void
  onBackToLogin: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', password_confirm: '' },
  })

  const onSubmit = async (values: NewPasswordValues) => {
    setServerError(null)
    try {
      const tokens = await confirmPasswordReset({
        reset_token: resetToken,
        new_password: values.password,
      })
      // Бэк возвращает access+refresh, но не профиль — забираем отдельно.
      const profile = await fetchClientProfile()
      setSession(tokens.access, tokens.refresh, profile)
      onSuccess()
      const next = searchParams.get('next')
      if (next) navigate(decodeURIComponent(next), { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось обновить пароль.')
      if (parsed.fields.password)
        setError('password', { type: 'server', message: parsed.fields.password })
      else if (parsed.general) setServerError(parsed.general)
    }
  }

  return (
    <>
      <p className="-mt-2 mb-6 text-sm text-textSecondary">
        Придумайте новый пароль — он сразу будет действовать для входа.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Определите новый пароль"
          type="password"
          autoComplete="new-password"
          hint="Минимум 8 символов, буква и цифра"
          {...register('password')}
          error={errors.password?.message}
        />
        <Input
          label="Подтверждение нового пароля"
          type="password"
          autoComplete="new-password"
          {...register('password_confirm')}
          error={errors.password_confirm?.message}
        />

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Восстановить пароль
        </Button>

        <BackToLogin onBackToLogin={onBackToLogin} />
      </form>
    </>
  )
}

// — small helpers —
function BackToLogin({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <div className="text-center">
      <BackToLoginLink onBackToLogin={onBackToLogin} />
    </div>
  )
}

function BackToLoginLink({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <button
      type="button"
      onClick={onBackToLogin}
      className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
    >
      Вернуться на вход
    </button>
  )
}
