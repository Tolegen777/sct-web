/**
 * Модалка регистрации клиента — теперь в ДВА шага (SMS-подтверждение).
 *
 *   Шаг 1 (form)   — Имя / телефон / пароль / подтверждение. На submit
 *                    POST /register/ создаёт пользователя и шлёт SMS, но
 *                    JWT НЕ возвращает. Пользователь ещё не авторизован.
 *   Шаг 2 (verify) — Ввод кода из SMS → POST /register/verify/ возвращает
 *                    access/refresh/user. Только тут логиним пользователя.
 *
 * На демо реальные SMS не шлются — код всегда `8888` (см. инструкцию бэка).
 *
 * Расхождение с API: бэк ждёт first_name + last_name отдельно, но дизайн
 * — одно поле. Поэтому split по первому пробелу в `splitFullName`.
 */
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Button } from '@/shared/ui/Button'
import { toast } from '@/shared/ui/Toast'
import { useAuthStore } from './store'
import { registerClient, resendRegistrationCode, verifyRegistration } from './api'
import {
  registerSchema,
  splitFullName,
  verifyCodeSchema,
  type RegisterFormValues,
  type VerifyCodeValues,
} from './schemas'
import { parseApiError } from './errors'
import { formatPhoneInput, unformatPhone } from '@/shared/lib/phone'

interface RegisterModalProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

const ERROR_BOX =
  'rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700'

export function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [phone, setPhone] = useState('')
  const [resendIn, setResendIn] = useState(60)

  const close = () => {
    onClose()
    // Сбрасываем стейт после анимации закрытия, чтобы не мигало.
    setTimeout(() => {
      setStep('form')
      setPhone('')
      setResendIn(60)
    }, 200)
  }

  return (
    <Modal open={open} onClose={close} size="sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-900 uppercase tracking-tight text-textPrimary">
          {step === 'form' ? 'Регистрация' : 'Подтверждение номера'}
        </h2>
        <p className="mt-1.5 text-sm text-textSecondary">
          {step === 'form'
            ? 'Регистрация строго по номеру телефона'
            : 'Введите код из SMS, чтобы завершить регистрацию'}
        </p>
      </div>

      {step === 'form' ? (
        <RegisterFormStep
          onSwitchToLogin={onSwitchToLogin}
          onRegistered={(normalizedPhone, resendAvailableIn) => {
            setPhone(normalizedPhone)
            setResendIn(resendAvailableIn)
            setStep('verify')
          }}
        />
      ) : (
        <PhoneVerifyStep phone={phone} initialResendIn={resendIn} onVerified={close} />
      )}
    </Modal>
  )
}

// === Шаг 1: форма регистрации ===
function RegisterFormStep({
  onSwitchToLogin,
  onRegistered,
}: {
  onSwitchToLogin: () => void
  onRegistered: (phone: string, resendAvailableIn: number) => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', phone: '', password: '', password_confirm: '' },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const { first_name, last_name } = splitFullName(values.full_name)
      const data = await registerClient({
        first_name,
        last_name,
        phone: unformatPhone(values.phone),
        password: values.password,
      })
      // Пользователь создан, SMS отправлена — НЕ логиним, идём на ввод кода.
      onRegistered(data.phone || unformatPhone(values.phone), data.resend_available_in ?? 60)
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось зарегистрироваться.')

      // Маппинг серверных полей first_name/last_name на наше единое поле.
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'first_name' || field === 'last_name' || field === 'full_name') {
          setError('full_name', { type: 'server', message })
        } else if (field === 'phone' || field === 'password' || field === 'password_confirm') {
          setError(field, { type: 'server', message })
        }
      }
      const knownFields = [
        'first_name',
        'last_name',
        'full_name',
        'phone',
        'password',
        'password_confirm',
      ]
      const allMapped = Object.keys(parsed.fields).every((f) => knownFields.includes(f))
      if (parsed.general || !allMapped) {
        setServerError(parsed.general)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Имя"
        placeholder="Иван"
        autoComplete="name"
        {...register('full_name')}
        error={errors.full_name?.message}
      />

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

      <Input
        label="Пароль"
        type="password"
        placeholder="Минимум 8 символов"
        autoComplete="new-password"
        {...register('password')}
        error={errors.password?.message}
      />

      <Input
        label="Подтвердите пароль"
        type="password"
        placeholder="Повторите пароль"
        autoComplete="new-password"
        {...register('password_confirm')}
        error={errors.password_confirm?.message}
      />

      {serverError && <div className={ERROR_BOX}>{serverError}</div>}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Зарегистрироваться
      </Button>

      <div className="pt-2 text-center text-sm text-textSecondary">
        Уже зарегистрированы?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-900 uppercase tracking-widest text-brandBlue hover:underline"
        >
          Войти
        </button>
      </div>
    </form>
  )
}

// === Шаг 2: подтверждение телефона кодом из SMS ===
function PhoneVerifyStep({
  phone,
  initialResendIn,
  onVerified,
}: {
  phone: string
  initialResendIn: number
  onVerified: () => void
}) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [resendIn, setResendIn] = useState(initialResendIn)
  const [resending, setResending] = useState(false)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyCodeValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  })

  // Таймер обратного отсчёта до повторной отправки SMS.
  useEffect(() => {
    if (resendIn <= 0) return
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [resendIn])

  const onSubmit = async (values: VerifyCodeValues) => {
    setServerError(null)
    try {
      const data = await verifyRegistration({ phone, code: values.code })
      if (!data.user) {
        setServerError('Сервер не вернул профиль клиента.')
        return
      }
      setSession(data.access, data.refresh, data.user)
      onVerified()
      const next = searchParams.get('next')
      if (next) navigate(decodeURIComponent(next), { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Неверный код подтверждения.')
      if (parsed.fields.code) {
        setError('code', { type: 'server', message: parsed.fields.code })
      } else {
        setServerError(parsed.general ?? 'Неверный код подтверждения.')
      }
    }
  }

  const onResend = async () => {
    if (resendIn > 0 || resending) return
    setServerError(null)
    setResending(true)
    try {
      const data = await resendRegistrationCode({ phone })
      setResendIn(data.resend_available_in ?? 60)
      toast.success('SMS отправлена повторно.')
    } catch (err) {
      const parsed = parseApiError(err, 'Не удалось отправить код повторно.')
      // Бэк может ответить «Можно повторить через N секунд.» — показываем как есть.
      setServerError(parsed.general ?? Object.values(parsed.fields)[0] ?? 'Не удалось отправить код повторно.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-center text-sm text-textSecondary">
        Мы отправили SMS с кодом на{' '}
        <span className="font-bold text-textPrimary">{formatPhoneInput(phone)}</span>
      </p>

      <Input
        label="Код из SMS"
        autoComplete="one-time-code"
        inputMode="numeric"
        maxLength={8}
        {...register('code')}
        error={errors.code?.message}
      />

      {serverError && <div className={ERROR_BOX}>{serverError}</div>}

      <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
        Подтвердить
      </Button>

      <div className="pt-2 text-center text-sm text-textSecondary">
        Не пришёл код?{' '}
        {resendIn > 0 ? (
          <span>
            Отправить повторно через <span className="font-bold text-textPrimary">{resendIn}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="font-900 uppercase tracking-widest text-brandBlue hover:underline disabled:opacity-50"
          >
            Отправить повторно
          </button>
        )}
      </div>
    </form>
  )
}
