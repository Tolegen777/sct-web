/**
 * Личный кабинет клиента (по дизайну new_screens).
 *
 * Layout: слева карточка профиля (аватар-инициалы, имя, телефон, статус,
 * «Выйти»), справа форма — Личные данные, Настройки системы (язык),
 * Уведомления (тумблеры), Безопасность (смена пароля), «Сохранить».
 *
 * ВНИМАНИЕ (бэк): PATCH /auth/profile/ сейчас отвечает 405 (BACKEND_NOTES
 * §4.3) — сохранение личных данных/пароля заработает после подключения ручки.
 * Язык и тумблеры уведомлений — клиентские настройки (бэк их не хранит),
 * пока держим как локальное состояние формы.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/store'
import { updateClientProfile } from '@/features/auth/api'
import { parseApiError } from '@/features/auth/errors'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Toggle } from '@/shared/ui/Toggle'
import type { ClientProfile } from '@/shared/api/types'

const schema = z
  .object({
    first_name: z.string().max(150, 'Слишком длинно').optional().or(z.literal('')),
    last_name: z.string().max(150, 'Слишком длинно').optional().or(z.literal('')),
    email: z.string().email('Неверный формат email').optional().or(z.literal('')),
    new_password: z.string().optional().or(z.literal('')),
    confirm_password: z.string().optional().or(z.literal('')),
  })
  .refine((d) => !d.new_password || d.new_password.length >= 8, {
    message: 'Минимум 8 символов',
    path: ['new_password'],
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

const STATUS_LABEL: Record<string, { text: string; ok: boolean }> = {
  ACTIVE: { text: 'Подтверждён по СМС', ok: true },
  INACTIVE: { text: 'Не подтверждён', ok: false },
  BLOCKED: { text: 'Заблокирован', ok: false },
  ARCHIVED: { text: 'В архиве', ok: false },
}

function initials(p: ClientProfile | null): string {
  if (!p) return '—'
  const f = p.first_name?.charAt(0) ?? ''
  const l = p.last_name?.charAt(0) ?? ''
  return (f + l).toUpperCase() || (p.phone?.slice(-2) ?? '—')
}

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)
  const logout = useAuthStore((s) => s.logout)

  const [language, setLanguage] = useState('ru')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      email: profile?.email ?? '',
      new_password: '',
      confirm_password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: updateClientProfile,
    onSuccess: (updated) => {
      setProfile(updated)
      setSaved(true)
      reset({
        first_name: updated.first_name ?? '',
        last_name: updated.last_name ?? '',
        email: updated.email ?? '',
        new_password: '',
        confirm_password: '',
      })
    },
    onError: (err) => setServerError(parseApiError(err, 'Не удалось сохранить изменения.').general),
  })

  const onSubmit = handleSubmit((values) => {
    setServerError(null)
    setSaved(false)
    mutation.mutate({
      first_name: values.first_name?.trim() || '',
      last_name: values.last_name?.trim() || '',
      email: values.email?.trim() || null,
      ...(values.new_password ? { password: values.new_password } : {}),
    })
  })

  if (!profile) return null

  const status = STATUS_LABEL[profile.status] ?? { text: profile.status, ok: false }

  return (
    <section className="container-sct py-6 md:py-10">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl font-900 uppercase tracking-tight text-textPrimary md:text-4xl">
          Личный кабинет
        </h1>
        <p className="mt-2 text-sm font-medium text-textSecondary md:text-base">
          Управляйте своими личными данными, настройками уведомлений и языком системы.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Карточка профиля */}
        <aside className="lg:col-span-4">
          <Card className="p-6 text-center md:p-8">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brandBlue text-2xl font-900 text-white">
              {initials(profile)}
            </div>
            <h2 className="mt-4 text-lg font-900 uppercase tracking-tight text-textPrimary">
              {profile.full_name || `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Клиент'}
            </h2>
            {profile.phone && (
              <p className="mt-1 font-mono text-sm font-bold text-textSecondary">{profile.phone}</p>
            )}

            <div className="mt-6 rounded-sct border border-borderLight bg-surfaceLight/60 p-4 text-left">
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Статус профиля
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-900 uppercase tracking-tight text-textPrimary">
                <span className={`h-2 w-2 rounded-full ${status.ok ? 'bg-green-500' : 'bg-textSecondary/40'}`} />
                {status.text}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-4 w-full rounded-sct border border-red-200 py-3.5 text-[12px] font-900 uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50"
            >
              Выйти из системы
            </button>
          </Card>
        </aside>

        {/* Форма */}
        <div className="lg:col-span-8">
          <Card className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Личные данные */}
              <section>
                <SectionTitle>Личные данные</SectionTitle>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Имя" {...register('first_name')} error={errors.first_name?.message} />
                  <Input label="Фамилия" {...register('last_name')} error={errors.last_name?.message} />
                  <Input
                    label="Номер телефона"
                    value={profile.phone ?? ''}
                    readOnly
                    className="cursor-not-allowed bg-surfaceMuted/60"
                  />
                  <Input
                    label="Электронная почта (email)"
                    type="email"
                    placeholder="client@sct.kz"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>
              </section>

              {/* Настройки системы */}
              <section className="border-t border-borderLight pt-8">
                <SectionTitle>Настройки системы</SectionTitle>
                <div className="mt-4 max-w-xs">
                  <Select
                    label="Язык интерфейса"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="ru">Русский (RU)</option>
                    <option value="kk">Қазақша (KK)</option>
                    <option value="en">English (EN)</option>
                  </Select>
                </div>
              </section>

              {/* Уведомления */}
              <section className="border-t border-borderLight pt-8">
                <SectionTitle>Уведомления</SectionTitle>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 rounded-sct border border-borderLight bg-surfaceLight/40 p-4">
                    <Toggle
                      checked={pushEnabled}
                      onChange={setPushEnabled}
                      label="Push-уведомления на телефон"
                      description="Оповещения о готовности авто, записи и новых акциях"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-sct border border-borderLight bg-surfaceLight/40 p-4">
                    <Toggle
                      checked={emailEnabled}
                      onChange={setEmailEnabled}
                      label="Уведомления на почту (email)"
                      description="Получение электронных квитанций, актов и отчётов"
                    />
                  </div>
                </div>
              </section>

              {/* Безопасность */}
              <section className="border-t border-borderLight pt-8">
                <SectionTitle>Безопасность</SectionTitle>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Новый пароль"
                    type="password"
                    placeholder="Заполните для изменения"
                    autoComplete="new-password"
                    {...register('new_password')}
                    error={errors.new_password?.message}
                  />
                  <Input
                    label="Повторите новый пароль"
                    type="password"
                    placeholder="Повторите новый пароль"
                    autoComplete="new-password"
                    {...register('confirm_password')}
                    error={errors.confirm_password?.message}
                  />
                </div>
              </section>

              {serverError && (
                <div className="rounded-sct border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {serverError}
                </div>
              )}
              {saved && (
                <div className="rounded-sct border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                  Изменения сохранены.
                </div>
              )}

              <div className="flex justify-end border-t border-borderLight pt-6">
                <button
                  type="submit"
                  disabled={mutation.isPending || !isDirty}
                  className="rounded-sct bg-brandBlue px-7 py-3.5 text-[12px] font-900 uppercase tracking-widest text-white shadow-soft-blue transition-all hover:bg-brandBlueDark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {mutation.isPending ? 'Сохраняем…' : 'Сохранить изменения'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[12px] font-900 uppercase tracking-widest text-textSecondary">
      {children}
    </h3>
  )
}
