import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelBooking, createBooking, fetchBooking, fetchBookings, updateBooking } from './api'
import type { BookingsListQuery, UpdateBookingPayload } from './types'

export const bookingsKeys = {
  all: ['bookings'] as const,
  list: (params?: BookingsListQuery) => [...bookingsKeys.all, 'list', params ?? {}] as const,
  detail: (id: number) => [...bookingsKeys.all, 'detail', id] as const,
}

export function useBookingsQuery(params?: BookingsListQuery, enabled = true) {
  return useQuery({
    queryKey: bookingsKeys.list(params),
    queryFn: () => fetchBookings(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useBookingQuery(id: number | undefined) {
  return useQuery({
    queryKey: id !== undefined ? bookingsKeys.detail(id) : ['bookings', 'detail', 'none'],
    queryFn: () => fetchBooking(id!),
    enabled: typeof id === 'number' && Number.isFinite(id),
  })
}

export function useCreateBookingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingsKeys.all })
      // Сервисная книжка тоже показывает записи — инвалидируем.
      qc.invalidateQueries({ queryKey: ['service-book'] })
    },
  })
}

export function useUpdateBookingMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateBookingPayload) => updateBooking(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingsKeys.all })
      qc.invalidateQueries({ queryKey: bookingsKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ['service-book'] })
    },
  })
}

export function useCancelBookingMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason?: string) => cancelBooking(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingsKeys.all })
      qc.invalidateQueries({ queryKey: bookingsKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ['service-book'] })
    },
  })
}
