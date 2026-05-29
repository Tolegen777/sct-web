/**
 * Модалка регистрации клиента.
 *
 * Дизайн: одно поле «Имя», телефон, пароль, «Подтвердите пароль». Внизу —
 * «Уже зарегистрированы? Войти».
 *
 * Расхождение с API: бэк ждёт first_name + last_name отдельно, но дизайн
 * — одно поле. Поэтому split по первому пробелу в `splitFullName`.
 */
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from './store'
import { registerClient } from './api'
import { registerSchema, splitFullName, type RegisterFormValues } from './schemas'
import { parseApiError } from './errors'
import { unformatPhone } from '@/shared/lib/phone'

interface RegisterModalProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const { first_name, last_name } = splitFullName(values.full_name)
      const payload = {
        first_name,
        last_name,
        phone: unformatPhone(values.phone),
        password: values.password,
      }
      const data = await registerClient(payload)
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
      const parsed = parseApiError(err, 'Не удалось зарегистрироваться.')

      // Маппинг серверных полей first_name/last_name на наше единое поле.
      for (const [field, message] of Object.entries(parsed.fields)) {
        if (field === 'first_name' || field === 'last_name' || field === 'full_name') {
          setError('full_name', { type: 'server', message })
        } else if (
          field === 'phone' ||
          field === 'password' ||
          field === 'password_confirm'
        ) {
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
      const allMapped = Object.keys(parsed.fields).every((f) =>
        knownFields.includes(f),
      )
      if (parsed.general || !allMapped) {
        setServerError(parsed.general)
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-900 uppercase tracking-tight text-textPrimary">
          Регистрация
        </h2>
        <p className="mt-1.5 text-sm text-textSecondary">
          Регистрация строго по номеру телефона
        </p>
      </div>
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

        {serverError && (
          <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

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
    </Modal>
  )
}
