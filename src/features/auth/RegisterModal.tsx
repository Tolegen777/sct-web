/**
 * Модалка регистрации клиента.
 *
 * Дизайн: одно поле «Имя», телефон, пароль, «Подтвердите пароль», поле
 * «Промокод» (опциональное — раскрывается по клику). Внизу — «Уже
 * зарегистрированы? Войти».
 *
 * Расхождение с API: бэк ждёт first_name + last_name отдельно, но дизайн
 * — одно поле. Поэтому split по первому пробелу в `splitFullName`.
 *
 * Поле promo_code пока отправляется, если введён; если бэк не принимает —
 * упадёт с 400, и мы покажем translated сообщение. ПМ ещё не решил,
 * подключать ли промокод. По BACKEND_NOTES.
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
import { registerSchema, splitFullName, type RegisterFormValues } from './schemas'
import { parseApiError } from './errors'

interface RegisterModalProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export function RegisterModal({ open, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [showPromo, setShowPromo] = useState(false)
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
      full_name: '',
      phone: '',
      password: '',
      password_confirm: '',
      promo_code: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      const { first_name, last_name } = splitFullName(values.full_name)
      const payload = {
        first_name,
        last_name,
        phone: values.phone,
        password: values.password,
        ...(values.promo_code ? { promo_code: values.promo_code } : {}),
      }
      const data = await registerClient(payload as Parameters<typeof registerClient>[0])
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
          field === 'password_confirm' ||
          field === 'promo_code'
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
        'promo_code',
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
    <Modal open={open} onClose={onClose} title="Регистрация" size="sm">
      <p className="-mt-2 mb-6 text-sm text-textSecondary">
        Регистрация займёт минуту. Понадобится номер телефона.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Имя"
          placeholder="Например, Нурсултан"
          autoComplete="name"
          {...register('full_name')}
          error={errors.full_name?.message}
          hint="Можно с фамилией через пробел"
        />

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

        {showPromo ? (
          <Input
            label="Промокод"
            placeholder="SCT-NEW-2026"
            autoComplete="off"
            {...register('promo_code')}
            error={errors.promo_code?.message}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowPromo(true)}
            className="text-[11px] font-900 uppercase tracking-widest text-brandBlue hover:underline"
          >
            + Добавить промокод
          </button>
        )}

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
