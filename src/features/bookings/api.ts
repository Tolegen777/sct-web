import { http } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  Booking,
  BookingsListResponse,
  CreateBookingPayload,
} from './types'

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

export async function createBooking(payload: CreateBookingPayload) {
  const response = await http.post<Booking>(endpoints.createBooking, payload)
  return response.data
}
