/**
 * Runtime-типы для админских записей (staff bookings).
 *
 * Бэк отдаёт похожую структуру на клиентский ClientServiceBooking, но с
 * полем `permissions` и `actions` для управления.
 *
 * Бэк-схема описывает многие поля как `additionalProperties {}` — поэтому
 * `car`, `service_package_data`, `service_station_data`, `permissions`,
 * `actions` приходят как объекты без чёткой схемы. Здесь — гибкий тип.
 */

export type BookingStatus =
  | 'DRAFT'
  | 'CREATED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED_BY_CLIENT'
  | 'CANCELLED_BY_STAFF'
  | 'NO_SHOW'
  | string

export interface StaffBookingClient {
  id?: number
  full_name?: string
  phone?: string
  email?: string | null
}

export interface StaffBookingCar {
  id?: number
  title?: string
  license_plate?: string
  vin_code?: string | null
  latest_mileage_km?: number | null
}

export interface StaffBookingPackage {
  id?: number
  title?: string
  category?: { id?: number; name?: string; code?: string } | null
  final_price?: string | null
  currency?: string
}

export interface StaffBookingStation {
  id?: number
  name?: string
  city?: string
  address?: string
}

export interface StaffBookingPermissions {
  can_cancel?: boolean
  can_change_status?: boolean
  can_change_schedule?: boolean
  can_change_station?: boolean
  can_edit_staff_note?: boolean
  can_edit_vin?: boolean
}

export interface StaffBooking {
  id: number
  status: BookingStatus
  status_label: string
  preferred_datetime: string | null
  scheduled_datetime: string | null
  final_datetime: string | null
  service_package_title_snapshot?: string
  car_title_snapshot?: string
  license_plate_snapshot?: string
  comment?: string
  staff_comment?: string
  cancel_reason?: string
  current_mileage_km?: number | null
  client?: StaffBookingClient
  car?: StaffBookingCar | Record<string, unknown>
  service_package_data?: StaffBookingPackage | Record<string, unknown>
  service_station_data?: StaffBookingStation | Record<string, unknown> | null
  permissions?: StaffBookingPermissions & Record<string, unknown>
  actions?: Record<string, unknown>
  price?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  // Бэк может вернуть и другие поля — оставляем гибкий индекс.
  [key: string]: unknown
}

export interface StaffBookingsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: StaffBooking[]
}

export interface StaffBookingsQuery {
  page?: number
  page_size?: number
  status?: BookingStatus
  search?: string
  category?: number
  service_station?: number
  ordering?: string
}

// === Payloads ===

export interface CancelPayload {
  cancel_reason?: string
}

export interface SchedulePayload {
  scheduled_datetime: string // ISO with TZ
  comment?: string
}

export interface StaffNotePayload {
  staff_comment: string
}

export interface StationPayload {
  service_station_id: number
  comment?: string
}

export interface StatusPayload {
  status: BookingStatus
  comment?: string
}

export interface VinPayload {
  vin_code: string
}
