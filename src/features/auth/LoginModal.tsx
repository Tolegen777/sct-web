/**
 * Модалка входа.
 * После успеха:
 *  1. Сохраняем токены + профиль через useAuthStore.setSession.
 *  2. Закрываем модалку.
 *  3. Если в URL есть ?next= — редиректим туда (использует RequireAuth).
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from './store'
import { loginClient } from './api'
import { loginSchema, type LoginFormValues } from './schemas'
import { parseApiError } from './errors'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

export function LoginModal({ open, onClose, onSwitchToRegister }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      const data = await loginClient(values)
      if (!data.user) {
        // На случай если бэк когда-нибудь начнёт возвращать токены без профиля.
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
      // Field-ошибки от бэка — прямо в RHF, чтобы подсветить поле.
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'phone' || field === 'password') {
          setError(field, { type: 'server', message })
        }
      }
      if (parsed.general) setServerError(parsed.general)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Вход в SCT Service">
      <p className="-mt-2 mb-6 text-sm text-textSecondary">
        Войдите для доступа к вашему гаражу и сервисной книжке.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Номер телефона"
          placeholder="+7 (___) ___-__-__"
          autoComplete="tel"
          inputMode="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-xs font-bold uppercase tracking-widest text-brandBlue"
            >
              {showPassword ? 'Скрыть' : 'Показ'}
            </button>
          }
        />

        <div className="text-right">
          <button
            type="button"
            disabled
            title="Скоро будет доступно"
            className="text-[11px] font-bold uppercase tracking-widest text-textSecondary opacity-60 cursor-not-allowed"
          >
            Забыли пароль?
          </button>
        </div>

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Войти
        </Button>

        <div className="pt-2 text-center text-sm text-textSecondary">
          Нет аккаунта?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-brandBlue hover:underline"
          >
            Зарегистрироваться
          </button>
        </div>
      </form>
    </Modal>
  )
}
