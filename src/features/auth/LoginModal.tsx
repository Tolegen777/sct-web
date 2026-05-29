/**
 * Модалка входа.
 *
 * Дизайн: заголовок «ВХОД В SCT SERVICE», 2 поля (телефон + пароль),
 * справа в пароле — иконка «глаз», под пароль — мелкая ссылка «Забыли
 * пароль?». Большая синяя кнопка «ВОЙТИ». Внизу — «Нет аккаунта?
 * Зарегистрироваться».
 */
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from './store'
import { loginClient } from './api'
import { loginSchema, type LoginFormValues } from './schemas'
import { parseApiError } from './errors'
import { unformatPhone } from '@/shared/lib/phone'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSwitchToRegister: () => void
  onForgotPassword: () => void
}

export function LoginModal({
  open,
  onClose,
  onSwitchToRegister,
  onForgotPassword,
}: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      // Отправляем номер без маски — бэк примет с маской тоже, но clean
      // форма безопаснее.
      const data = await loginClient({
        phone: unformatPhone(values.phone),
        password: values.password,
      })
      if (!data.user) {
        setServerError('Сервер не вернул профиль клиента.')
        return
      }
      setSession(data.access, data.refresh, data.user)
      reset()
      onClose()
      const next = searchParams.get('next')
      if (next) navigate(decodeURIComponent(next), { replace: true })
    } catch (err) {
      const parsed = parseApiError(err, 'Неверный телефон или пароль.')
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'phone' || field === 'password') {
          setError(field, { type: 'server', message })
        }
      }
      if (parsed.general) setServerError(parsed.general)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-900 uppercase tracking-tight text-textPrimary">
          Вход в SCT Service
        </h2>
        <p className="mt-1.5 text-sm text-textSecondary">
          Введите свои данные для авторизации
        </p>
      </div>
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
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-[11px] font-800 uppercase tracking-widest text-textSecondary">
              Пароль
            </span>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-bold uppercase tracking-widest text-brandBlue hover:underline"
            >
              Забыли пароль?
            </button>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-textSecondary hover:text-brandBlue"
                title={showPassword ? 'Скрыть' : 'Показать'}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
        </div>

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Войти
        </Button>

        <div className="pt-2 text-center text-sm text-textSecondary">
          Нет аккаунта?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-900 uppercase tracking-widest text-brandBlue hover:underline"
          >
            Зарегистрироваться
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
      <circle cx="12" cy="12" r="3" strokeWidth={2} />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18"
      />
    </svg>
  )
}
