/**
 * API-функции админских записей на сервис.
 *
 * Список (`GET /staff/bookings/`) и детальная (`GET .../:id/`), плюс
 * 6 PATCH под отдельные действия: cancel / schedule / staff-note /
 * station / status / vin. Бэк намеренно разделил мутации, чтобы каждая
 * проверяла свои permissions.
 *
 * Используем staffHttp — отдельный axios-инстанс с staff-токеном.
 */
import { staffHttp } from '@/shared/api/staff-http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  CancelPayload,
  SchedulePayload,
  StaffBooking,
  StaffBookingsListResponse,
  StaffBookingsQuery,
  StaffNotePayload,
  StationPayload,
  StatusPayload,
  VinPayload,
} from './types'

function pickParams(q?: StaffBookingsQuery): Record<string, string | number> {
  if (!q) return {}
  const out: Record<string, string | number> = {}
  if (q.page) out.page = q.page
  if (q.page_size) out.page_size = q.page_size
  if (q.status) out.status = q.status
  if (q.search) out.search = q.search
  if (q.category) out.category = q.category
  if (q.service_station) out.service_station = q.service_station
  if (q.ordering) out.ordering = q.ordering
  return out
}

export async function fetchStaffBookings(q?: StaffBookingsQuery) {
  const response = await staffHttp.get<StaffBookingsListResponse | StaffBooking[]>(
    endpoints.staffBookings,
    { params: pickParams(q) },
  )
  const data = response.data
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  return data
}

export async function fetchStaffBooking(id: number) {
  const response = await staffHttp.get<StaffBooking>(endpoints.staffBooking(id))
  return response.data
}

export async function cancelStaffBooking(id: number, payload: CancelPayload) {
  const response = await staffHttp.patch<StaffBooking>(
    endpoints.staffBookingCancel(id),
    payload,
  )
  return response.data
}

export async function scheduleStaffBooking(id: number, payload: SchedulePayload) {
  const response = await staffHttp.patch<StaffBooking>(
    endpoints.staffBookingSchedule(id),
    payload,
  )
  return response.data
}

export async function updateStaffBookingStaffNote(
  id: number,
  payload: StaffNotePayload,
) {
  const response = await staffHttp.patch<StaffBooking>(
    endpoints.staffBookingStaffNote(id),
    payload,
  )
  return response.data
}

export async function updateStaffBookingStation(
  id: number,
  payload: StationPayload,
) {
  const response = await staffHttp.patch<StaffBooking>(
    endpoints.staffBookingStation(id),
    payload,
  )
  return response.data
}

export async function updateStaffBookingStatus(id: number, payload: StatusPayload) {
  const response = await staffHttp.patch<StaffBooking>(
    endpoints.staffBookingStatus(id),
    payload,
  )
  return response.data
}

export async function updateStaffBookingVin(id: number, payload: VinPayload) {
  const response = await staffHttp.patch<StaffBooking>(
    endpoints.staffBookingVin(id),
    payload,
  )
  return response.data
}

/**
 * Список филиалов под staff-токеном — для модалки «Изменить СТО».
 * `useServiceStationsQuery` гейтится на клиентском логине, поэтому
 * отдельный запрос с staffHttp.
 */
export async function fetchStaffStations() {
  const response = await staffHttp.get<{
    results: Array<{ id: number; name: string; city: string; address: string }>
  } | Array<{ id: number; name: string; city: string; address: string }>>(
    endpoints.serviceStations,
    { params: { days: 1 } },
  )
  const data = response.data
  if (Array.isArray(data)) return data
  return data.results ?? []
}
