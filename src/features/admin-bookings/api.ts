/**
 * API-функции админских записей на сервис.
 *
 * Бэк объединил все действия (status / schedule / station / staff-note /
 * service / price) в один PATCH-эндпоинт. Cancel остался отдельным POST.
 * GET /staff/bookings/options/ отдаёт справочники (СТО, пакеты,
 * default-услуги) для модалок выбора.
 */
import { staffHttp } from '@/shared/api/staff-http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  CancelPayload,
  StaffBooking,
  StaffBookingPatch,
  StaffBookingsListResponse,
  StaffBookingsOptions,
  StaffBookingsQuery,
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

/**
 * Универсальный PATCH-апдейт записи. Поддерживает все поля сразу или
 * частично — статус, даты, СТО, услуга, цена, заметка, и т.д.
 */
export async function updateStaffBooking(id: number, payload: StaffBookingPatch) {
  const response = await staffHttp.patch<StaffBooking>(endpoints.staffBooking(id), payload)
  return response.data
}

export async function cancelStaffBooking(id: number, payload: CancelPayload) {
  const response = await staffHttp.post<StaffBooking>(
    endpoints.staffBookingCancel(id),
    payload,
  )
  return response.data
}

export async function fetchStaffBookingsOptions() {
  const response = await staffHttp.get<StaffBookingsOptions>(
    endpoints.staffBookingsOptions,
  )
  return response.data
}
