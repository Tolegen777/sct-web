/**
 * Runtime-типы для админских записей (staff bookings).
 *
 * Бэк объединил все действия в один PATCH-эндпоинт. Поля для патча
 * описывает PatchedStaffBookingUpdateRequest в OpenAPI schema (см.
 * Template.yaml).
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

export type ServiceType = 'PACKAGE' | 'DEFAULT' | string

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
  can_edit?: boolean
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

// === Опции для модалок (GET /staff/bookings/options/) ===

export interface OptionStation {
  id: number
  name: string
  slug?: string
  city?: string
  address?: string
  phone?: string
  is_active?: boolean
  label: string
}

export interface OptionPackage {
  id: number
  title: string
  slug?: string
  status?: string
  currency?: string
  price?: number | string
  label: string
}

export interface OptionDefaultService {
  id: number
  title: string
  slug?: string
  status?: string
  price_note?: string
  label: string
}

export interface StaffBookingsOptions {
  stations: OptionStation[]
  service_packages: OptionPackage[]
  default_services: OptionDefaultService[]
}

// === Payload для PATCH /staff/bookings/{id}/ ===

export interface StaffBookingPatch {
  status?: BookingStatus
  preferred_datetime?: string
  scheduled_datetime?: string | null
  service_station_id?: number | null
  service_type?: ServiceType
  service_package_id?: number | null
  default_service_page_id?: number | null
  mileage_km?: number | null
  price_snapshot?: string | null
  currency?: string
  staff_comment?: string
  cancel_reason?: string
}

export interface CancelPayload {
  cancel_reason?: string
}
