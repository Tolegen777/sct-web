import { http } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  Booking,
  BookingsListResponse,
  CreateBookingPayload,
  UpdateBookingPayload,
} from './types'

/**
 * Ответ /create_booking/ — обёртка над booking.
 * Бэк возвращает {success, message, booking}, а не голый Booking.
 */
interface CreateBookingResponse {
  success: boolean
  message: string
  booking: Booking
}

export async function fetchBookings() {
  const response = await http.get<BookingsListResponse | Booking[]>(endpoints.bookings)
  const data = response.data
  if (Array.isArray(data)) return data
  return data.results ?? []
}

export async function fetchBooking(id: number) {
  const response = await http.get<Booking>(endpoints.booking(id))
  return response.data
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  // Бэк возвращает {success, message, booking}, нормализуем в Booking.
  const response = await http.post<CreateBookingResponse | Booking>(
    endpoints.createBooking,
    payload,
  )
  const data = response.data as Partial<CreateBookingResponse> & Partial<Booking>
  if (data && typeof data === 'object' && 'booking' in data && data.booking) {
    return data.booking as Booking
  }
  return data as Booking
}

/**
 * Отмена записи клиентом. Доступна только для статусов DRAFT/CREATED/CONFIRMED
 * (бэк сам проверит). Опционально можно передать `reason`.
 */
export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const response = await http.post<CreateBookingResponse | Booking>(
    endpoints.bookingCancel(id),
    reason ? { reason } : {},
  )
  const data = response.data as Partial<CreateBookingResponse> & Partial<Booking>
  if (data && typeof data === 'object' && 'booking' in data && data.booking) {
    return data.booking as Booking
  }
  return data as Booking
}

export async function updateBooking(id: number, payload: UpdateBookingPayload): Promise<Booking> {
  const response = await http.patch<CreateBookingResponse | Booking>(
    endpoints.booking(id),
    payload,
  )
  const data = response.data as Partial<CreateBookingResponse> & Partial<Booking>
  if (data && typeof data === 'object' && 'booking' in data && data.booking) {
    return data.booking as Booking
  }
  return data as Booking
}
