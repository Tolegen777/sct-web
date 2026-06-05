/**
 * Детальная запись на сервис для админа.
 *
 * Бэк объединил все действия в один PATCH /staff/bookings/{id}/, поэтому
 * используется одна универсальная мутация — каждая модалка патчит свой
 * набор полей. Cancel остался отдельным POST.
 *
 * Опции (СТО, пакеты, default-услуги) — из GET /staff/bookings/options/.
 *
 * Действия из мокапа bookings_detail.html:
 *   - Изменить статус         → { status, staff_comment? }
 *   - Назначить дату и время  → { scheduled_datetime }
 *   - Изменить СТО            → { service_station_id }
 *   - Изменить услугу         → { service_type, service_package_id | default_service_page_id }
 *   - Изменить стоимость      → { price_snapshot }
 *   - Заметка сотрудника      → { staff_comment }
 *   - Отменить запись         → cancel POST
 */
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useCancelStaffBookingMutation,
  useStaffBookingQuery,
  useStaffBookingsOptionsQuery,
  useUpdateStaffBookingMutation,
} from '@/features/admin-bookings/queries'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'
import { Modal } from '@/shared/ui/Modal'
import { Spinner } from '@/shared/ui/Spinner'
import { toast } from '@/shared/ui/Toast'
import { parseApiError } from '@/features/auth/errors'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'
import type {
  BookingStatus,
  ServiceType,
  StaffBooking,
} from '@/features/admin-bookings/types'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Черновик',
  CREATED: 'Создана',
  CONFIRMED: 'Подтверждена',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Завершена',
  CANCELLED_BY_CLIENT: 'Отменена клиентом',
  CANCELLED_BY_STAFF: 'Отменена сотрудником',
  NO_SHOW: 'Клиент не приехал',
}

const STATUS_TONE: Record<string, string> = {
  DRAFT: 'bg-surfaceMuted text-textSecondary',
  CREATED: 'bg-blue-50 text-brandBlue',
  CONFIRMED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED_BY_CLIENT: 'bg-red-50 text-red-700',
  CANCELLED_BY_STAFF: 'bg-red-50 text-red-700',
  NO_SHOW: 'bg-red-50 text-red-700',
}

type ActionKind =
  | 'status'
  | 'schedule'
  | 'station'
  | 'service'
  | 'price'
  | 'note'
  | 'cancel'
  | null

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id ? Number(params.id) : undefined
  const navigate = useNavigate()
  const { data, isLoading, isError } = useStaffBookingQuery(id)
  const [action, setAction] = useState<ActionKind>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !data || !id) {
    return (
      <section>
        <Card className="p-6 text-center">
          <p className="font-bold text-red-700">Запись не найдена или недоступна.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate('/admin/bookings')}>
            ← К списку
          </Button>
        </Card>
      </section>
    )
  }

  const perms = (data.permissions ?? {}) as Record<string, boolean | unknown>
  const client = (data.client ?? {}) as Record<string, string | number | null | undefined>
  const car = (data.car ?? {}) as Record<string, unknown>
  const pkg = (data.service_package_data ?? {}) as Record<string, unknown>
  const station = (data.service_station_data ?? null) as Record<string, unknown> | null
  // Большинство кнопок гейтятся на can_edit (бэк отдаёт его в permissions).
  const canEdit = perms.can_edit !== false

  return (
    <section className="space-y-6">
      <Link
        to="/admin/bookings"
        className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-textSecondary hover:text-brandBlue"
      >
        ← К списку записей
      </Link>

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-900 uppercase tracking-tight text-textPrimary md:text-4xl">
            Запись <span className="text-brandBlue">#{data.id}</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-textSecondary">
            Создана {data.created_at ? formatDateTime(data.created_at) : '—'}
          </p>
        </div>
        <span
          className={cn(
            'inline-block self-start rounded-md px-3 py-1.5 text-[11px] font-900 uppercase tracking-widest',
            STATUS_TONE[data.status] ?? 'bg-surfaceMuted text-textSecondary',
          )}
        >
          {data.status_label || STATUS_LABELS[data.status] || data.status}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Контент */}
        <div className="space-y-4 lg:col-span-8">
          <Card className="p-5 md:p-6">
            <SectionTitle>Клиент</SectionTitle>
            <Row label="ФИО" value={String(client.full_name ?? '—')} />
            <Row label="Телефон" value={String(client.phone ?? '—')} mono />
            <Row label="Email" value={String(client.email ?? '—')} />
          </Card>

          <Card className="p-5 md:p-6">
            <SectionTitle>Автомобиль</SectionTitle>
            <Row label="Название" value={String(car.title ?? data.car_title_snapshot ?? '—')} />
            <Row
              label="Госномер"
              value={String((car.license_plate as string) ?? data.license_plate_snapshot ?? '—')}
              mono
            />
            <Row label="VIN" value={String((car.vin_code as string) ?? '—')} mono />
            <Row
              label="Пробег"
              value={
                typeof data.current_mileage_km === 'number'
                  ? `${data.current_mileage_km.toLocaleString('ru-RU')} км`
                  : '—'
              }
            />
          </Card>

          <Card className="p-5 md:p-6">
            <SectionTitle>Услуга</SectionTitle>
            <Row
              label="Название"
              value={String(pkg.title ?? data.service_package_title_snapshot ?? '—')}
            />
            <Row
              label="Категория"
              value={String(
                ((pkg.category as { name?: string } | undefined)?.name as string) ?? '—',
              )}
            />
            <Row
              label="Цена"
              value={
                typeof pkg.final_price === 'string' && pkg.final_price
                  ? formatMoney(pkg.final_price, (pkg.currency as string) ?? 'KZT')
                  : '—'
              }
              accent
            />
          </Card>

          <Card className="p-5 md:p-6">
            <SectionTitle>План визита</SectionTitle>
            <Row
              label="Желаемая дата клиента"
              value={data.preferred_datetime ? formatDateTime(data.preferred_datetime) : '—'}
            />
            <Row
              label="Назначенное время"
              value={
                data.scheduled_datetime
                  ? formatDateTime(data.scheduled_datetime)
                  : 'Не назначено'
              }
              accent
            />
            {data.final_datetime && (
              <Row label="Финальное время" value={formatDateTime(data.final_datetime)} accent />
            )}
            <Row
              label="СТО"
              value={
                station
                  ? `${(station.name as string) ?? ''}, ${(station.address as string) ?? ''}`
                  : 'Не выбрана'
              }
            />
          </Card>

          {(data.comment || data.staff_comment) && (
            <Card className="p-5 md:p-6">
              <SectionTitle>Комментарии</SectionTitle>
              {data.comment && (
                <div className="mt-3">
                  <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                    Комментарий клиента
                  </p>
                  <p className="mt-1 whitespace-pre-line rounded-sct border border-borderLight bg-surfaceLight/40 p-3 text-sm text-textPrimary">
                    {data.comment}
                  </p>
                </div>
              )}
              {data.staff_comment && (
                <div className="mt-4">
                  <p className="text-[10px] font-900 uppercase tracking-widest text-brandBlue">
                    Заметка сотрудника (видна только команде)
                  </p>
                  <p className="mt-1 whitespace-pre-line rounded-sct border border-blue-100 bg-blue-50/40 p-3 text-sm text-textPrimary">
                    {data.staff_comment}
                  </p>
                </div>
              )}
            </Card>
          )}

          {data.cancel_reason && (
            <Card className="p-5 md:p-6">
              <SectionTitle>Причина отмены</SectionTitle>
              <p className="mt-3 whitespace-pre-line text-sm text-red-700">{data.cancel_reason}</p>
            </Card>
          )}
        </div>

        {/* Панель действий */}
        <aside className="lg:col-span-4">
          <div className="space-y-2 lg:sticky lg:top-24">
            <Card className="p-5 md:p-6">
              <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
                Панель действий
              </p>
              <div className="mt-4 space-y-2">
                <ActionBtn label="Изменить статус" onClick={() => setAction('status')} disabled={!canEdit} />
                <ActionBtn label="Назначить дату и время" onClick={() => setAction('schedule')} disabled={!canEdit} />
                <ActionBtn label="Изменить СТО" onClick={() => setAction('station')} disabled={!canEdit} />
                <ActionBtn label="Изменить услугу" onClick={() => setAction('service')} disabled={!canEdit} />
                <ActionBtn label="Изменить стоимость" onClick={() => setAction('price')} disabled={!canEdit} />
                <ActionBtn label="Заметка сотрудника" onClick={() => setAction('note')} disabled={!canEdit} />
                <ActionBtn
                  label="Отменить запись"
                  danger
                  onClick={() => setAction('cancel')}
                  disabled={perms.can_cancel === false}
                />
              </div>
            </Card>
          </div>
        </aside>
      </div>

      {action === 'status' && <StatusModal booking={data} onClose={() => setAction(null)} />}
      {action === 'schedule' && <ScheduleModal booking={data} onClose={() => setAction(null)} />}
      {action === 'station' && <StationModal booking={data} onClose={() => setAction(null)} />}
      {action === 'service' && <ServiceModal booking={data} onClose={() => setAction(null)} />}
      {action === 'price' && <PriceModal booking={data} onClose={() => setAction(null)} />}
      {action === 'note' && <StaffNoteModal booking={data} onClose={() => setAction(null)} />}
      {action === 'cancel' && <CancelModal booking={data} onClose={() => setAction(null)} />}
    </section>
  )
}

// === Вспомогательные ===

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-900 uppercase tracking-widest text-textSecondary">
      {children}
    </p>
  )
}

function Row({
  label,
  value,
  mono,
  accent,
}: {
  label: string
  value: string
  mono?: boolean
  accent?: boolean
}) {
  return (
    <div className="mt-3 flex items-start justify-between gap-3 text-sm">
      <span className="text-[10px] font-bold uppercase tracking-widest text-textSecondary">
        {label}
      </span>
      <span
        className={cn(
          'text-right',
          mono && 'font-mono text-[12px]',
          accent ? 'font-900 text-brandBlue' : 'font-bold text-textPrimary',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function ActionBtn({
  label,
  onClick,
  disabled,
  danger,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-sct border px-4 py-3 text-[12px] font-900 uppercase tracking-widest transition-all disabled:cursor-not-allowed disabled:opacity-40',
        danger
          ? 'border-red-200 bg-white text-red-600 hover:bg-red-50'
          : 'border-borderLight bg-white text-textPrimary hover:border-brandBlue hover:text-brandBlue',
      )}
    >
      {label}
      <span aria-hidden>→</span>
    </button>
  )
}

// === Модалки действий — все через один PATCH ===

function StatusModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useUpdateStaffBookingMutation(booking.id)
  const [status, setStatus] = useState<BookingStatus>(booking.status)
  const [comment, setComment] = useState('')

  return (
    <Modal open onClose={onClose} size="sm">
      <h2 className="mb-5 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Изменение статуса
      </h2>
      <Select label="Новый статус" value={status} onChange={(e) => setStatus(e.target.value)}>
        {Object.entries(STATUS_LABELS).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </Select>
      <div className="mt-4">
        <Textarea
          label="Комментарий к изменению (необязательно)"
          rows={3}
          placeholder="Например: клиент подтвердил по телефону…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <SubmitRow
        onClose={onClose}
        loading={mutation.isPending}
        label="Сохранить статус"
        onSubmit={() => {
          mutation.mutate(
            {
              status,
              ...(comment.trim() ? { staff_comment: comment.trim() } : {}),
            },
            {
              onSuccess: () => {
                toast.success('Статус обновлён')
                onClose()
              },
              onError: (e) => toast.error(parseApiError(e, 'Не удалось обновить статус.').general),
            },
          )
        }}
      />
    </Modal>
  )
}

function ScheduleModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useUpdateStaffBookingMutation(booking.id)
  const initial = booking.scheduled_datetime ?? booking.preferred_datetime ?? ''
  const [dt, setDt] = useState(initial ? toLocalInputValue(initial) : '')

  return (
    <Modal open onClose={onClose} size="sm">
      <h2 className="mb-5 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Назначить дату и время
      </h2>
      <Input
        label="Дата и время визита"
        type="datetime-local"
        value={dt}
        onChange={(e) => setDt(e.target.value)}
      />
      <SubmitRow
        onClose={onClose}
        loading={mutation.isPending}
        label="Назначить"
        disabled={!dt}
        onSubmit={() => {
          mutation.mutate(
            { scheduled_datetime: fromLocalInputValue(dt) },
            {
              onSuccess: () => {
                toast.success('Дата и время назначены')
                onClose()
              },
              onError: (e) => toast.error(parseApiError(e, 'Не удалось назначить время.').general),
            },
          )
        }}
      />
    </Modal>
  )
}

function StationModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useUpdateStaffBookingMutation(booking.id)
  const { data: options, isLoading } = useStaffBookingsOptionsQuery()
  const currentId = (booking.service_station_data as { id?: number } | null)?.id ?? null
  const [stationId, setStationId] = useState<string>(currentId ? String(currentId) : '')

  return (
    <Modal open onClose={onClose} size="sm">
      <h2 className="mb-5 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Изменить СТО
      </h2>
      <Select
        label="Сервисный центр"
        value={stationId}
        onChange={(e) => setStationId(e.target.value)}
        disabled={isLoading}
      >
        <option value="">— Выберите СТО —</option>
        {(options?.stations ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </Select>
      <SubmitRow
        onClose={onClose}
        loading={mutation.isPending}
        label="Сохранить СТО"
        disabled={!stationId}
        onSubmit={() => {
          mutation.mutate(
            { service_station_id: Number(stationId) },
            {
              onSuccess: () => {
                toast.success('СТО обновлён')
                onClose()
              },
              onError: (e) => toast.error(parseApiError(e, 'Не удалось обновить СТО.').general),
            },
          )
        }}
      />
    </Modal>
  )
}

function ServiceModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useUpdateStaffBookingMutation(booking.id)
  const { data: options, isLoading } = useStaffBookingsOptionsQuery()
  const [type, setType] = useState<ServiceType>('PACKAGE')
  const [packageId, setPackageId] = useState('')
  const [defaultId, setDefaultId] = useState('')
  const [search, setSearch] = useState('')

  const filteredPackages = (options?.service_packages ?? []).filter((p) =>
    p.label.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <Modal open onClose={onClose} size="md">
      <h2 className="mb-5 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Изменить услугу
      </h2>
      <Select
        label="Тип услуги"
        value={type}
        onChange={(e) => setType(e.target.value as ServiceType)}
      >
        <option value="PACKAGE">Пакет услуги</option>
        <option value="DEFAULT">Дефолтная услуга</option>
      </Select>

      {type === 'PACKAGE' && (
        <>
          <div className="mt-4">
            <Input
              label="Поиск пакета"
              placeholder="Название, авто..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mt-3 max-h-[260px] overflow-y-auto rounded-sct border border-borderLight">
            {isLoading ? (
              <div className="p-6 text-center"><Spinner /></div>
            ) : filteredPackages.length === 0 ? (
              <div className="p-6 text-center text-sm text-textSecondary">Ничего не нашлось.</div>
            ) : (
              <ul className="divide-y divide-borderLight">
                {filteredPackages.slice(0, 50).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setPackageId(String(p.id))}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-surfaceLight',
                        packageId === String(p.id) && 'bg-blue-50',
                      )}
                    >
                      <span className="min-w-0 truncate font-bold text-textPrimary">{p.label}</span>
                      {p.price && (
                        <span className="shrink-0 font-mono text-[12px] font-bold text-brandBlue">
                          {formatMoney(String(p.price), p.currency ?? 'KZT')}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {type === 'DEFAULT' && (
        <div className="mt-4">
          <Select
            label="Дефолтная услуга"
            value={defaultId}
            onChange={(e) => setDefaultId(e.target.value)}
            disabled={isLoading}
          >
            <option value="">— Выберите —</option>
            {(options?.default_services ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
                {s.price_note ? ` · ${s.price_note}` : ''}
              </option>
            ))}
          </Select>
        </div>
      )}

      <SubmitRow
        onClose={onClose}
        loading={mutation.isPending}
        label="Сохранить услугу"
        disabled={
          (type === 'PACKAGE' && !packageId) || (type === 'DEFAULT' && !defaultId)
        }
        onSubmit={() => {
          const payload =
            type === 'PACKAGE'
              ? { service_type: 'PACKAGE' as const, service_package_id: Number(packageId), default_service_page_id: null }
              : { service_type: 'DEFAULT' as const, default_service_page_id: Number(defaultId), service_package_id: null }
          mutation.mutate(payload, {
            onSuccess: () => {
              toast.success('Услуга обновлена')
              onClose()
            },
            onError: (e) => toast.error(parseApiError(e, 'Не удалось обновить услугу.').general),
          })
        }}
      />
    </Modal>
  )
}

function PriceModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useUpdateStaffBookingMutation(booking.id)
  const currentPrice = (booking.price as { final?: string | number } | undefined)?.final ?? ''
  const [price, setPrice] = useState(String(currentPrice ?? ''))

  return (
    <Modal open onClose={onClose} size="sm">
      <h2 className="mb-5 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Изменить стоимость
      </h2>
      <Input
        label="Новая итоговая стоимость"
        type="text"
        inputMode="decimal"
        placeholder="15000.00"
        value={price}
        onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, '').replace(',', '.'))}
      />
      <p className="mt-2 text-[11px] font-medium text-textSecondary">
        Цена будет зафиксирована как индивидуальный расчёт для этой записи.
      </p>
      <SubmitRow
        onClose={onClose}
        loading={mutation.isPending}
        label="Сохранить стоимость"
        disabled={!price.trim()}
        onSubmit={() => {
          mutation.mutate(
            { price_snapshot: price.trim() },
            {
              onSuccess: () => {
                toast.success('Стоимость обновлена')
                onClose()
              },
              onError: (e) => toast.error(parseApiError(e, 'Не удалось обновить стоимость.').general),
            },
          )
        }}
      />
    </Modal>
  )
}

function StaffNoteModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useUpdateStaffBookingMutation(booking.id)
  const [note, setNote] = useState(booking.staff_comment ?? '')

  return (
    <Modal open onClose={onClose} size="sm">
      <h2 className="mb-3 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Заметка сотрудника
      </h2>
      <p className="mb-5 text-center text-[11px] font-medium text-textSecondary">
        Видна только команде SCT, клиент её не видит.
      </p>
      <Textarea
        label="Внутренняя заметка"
        rows={5}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <SubmitRow
        onClose={onClose}
        loading={mutation.isPending}
        label="Сохранить заметку"
        onSubmit={() => {
          mutation.mutate(
            { staff_comment: note.trim() },
            {
              onSuccess: () => {
                toast.success('Заметка сохранена')
                onClose()
              },
              onError: (e) => toast.error(parseApiError(e, 'Не удалось сохранить заметку.').general),
            },
          )
        }}
      />
    </Modal>
  )
}

function CancelModal({ booking, onClose }: { booking: StaffBooking; onClose: () => void }) {
  const mutation = useCancelStaffBookingMutation(booking.id)
  const [reason, setReason] = useState('')

  return (
    <Modal open onClose={onClose} size="sm">
      <h2 className="mb-3 text-center text-2xl font-900 uppercase tracking-tight text-textPrimary">
        Отменить запись?
      </h2>
      <p className="mb-5 text-center text-sm text-textSecondary">
        Действие нельзя отменить. Укажите причину для истории.
      </p>
      <Textarea
        label="Причина отмены"
        rows={3}
        placeholder="Например: клиент не приехал, перенос на следующую неделю…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      <div className="mt-5 flex gap-3">
        <Button variant="ghost" fullWidth onClick={onClose} disabled={mutation.isPending}>
          Не отменять
        </Button>
        <Button
          variant="danger"
          fullWidth
          loading={mutation.isPending}
          onClick={() =>
            mutation.mutate(
              { cancel_reason: reason.trim() || undefined },
              {
                onSuccess: () => {
                  toast.success('Запись отменена')
                  onClose()
                },
                onError: (e) =>
                  toast.error(parseApiError(e, 'Не удалось отменить запись.').general),
              },
            )
          }
        >
          Отменить запись
        </Button>
      </div>
    </Modal>
  )
}

function SubmitRow({
  onClose,
  loading,
  label,
  onSubmit,
  disabled,
}: {
  onClose: () => void
  loading: boolean
  label: string
  onSubmit: () => void
  disabled?: boolean
}) {
  return (
    <div className="mt-5 flex gap-3">
      <Button variant="ghost" fullWidth onClick={onClose} disabled={loading}>
        Отмена
      </Button>
      <Button variant="primary" fullWidth loading={loading} disabled={disabled} onClick={onSubmit}>
        {label}
      </Button>
    </div>
  )
}

// === datetime-local helpers ===
function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInputValue(v: string): string {
  return new Date(v).toISOString()
}
