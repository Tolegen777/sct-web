/**
 * Модалка регистрации клиента.
 * Поля: имя, фамилия (опционально), телефон, пароль, подтверждение.
 *
 * Поле «промокод» в дизайне есть, но в ClientRegisterRequest на бэке его нет.
 * Сейчас не добавляем — спросил у ПМа, ждём ответа. Если потом нужно — это
 * 5 минут работы.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from './store'
import { registerClient } from './api'
import { registerSchema, type RegisterFormValues } from './schemas'
import { parseApiError } from './errors'

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
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      // password_confirm — клиентское поле, не отправляем на бэк.
      const data = await registerClient({
        first_name: values.first_name,
        last_name: values.last_name || '',
        phone: values.phone,
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
      const parsed = parseApiError(err, 'Не удалось зарегистрироваться.')
      const knownFields: (keyof RegisterFormValues)[] = [
        'first_name',
        'last_name',
        'phone',
        'password',
        'password_confirm',
      ]
      for (const [field, message] of Object.entries(parsed.fields)) {
        if ((knownFields as string[]).includes(field)) {
          setError(field as keyof RegisterFormValues, {
            type: 'server',
            message,
          })
        }
      }
      // Если все ошибки попали в поля и нет общей — общую плашку не показываем.
      const allMappedToFields = Object.keys(parsed.fields).every((f) =>
        (knownFields as string[]).includes(f),
      )
      if (parsed.general || !allMappedToFields) {
        setServerError(parsed.general)
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Регистрация">
      <p className="-mt-2 mb-6 text-sm text-textSecondary">
        Регистрация займёт минуту. Понадобится номер телефона.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Имя"
            placeholder="Нурсултан"
            autoComplete="given-name"
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input
            label="Фамилия"
            placeholder="Не обязательно"
            autoComplete="family-name"
            {...register('last_name')}
            error={errors.last_name?.message}
          />
        </div>

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
          type="password"
          autoComplete="new-password"
          hint="Минимум 8 символов"
          {...register('password')}
          error={errors.password?.message}
        />

        <Input
          label="Подтвердите пароль"
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

        <Button type="submit" fullWidth loading={isSubmitting}>
          Зарегистрироваться
        </Button>

        <div className="pt-2 text-center text-sm text-textSecondary">
          Уже зарегистрированы?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-brandBlue hover:underline"
          >
            Войти
          </button>
        </div>
      </form>
    </Modal>
  )
}
