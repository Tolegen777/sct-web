import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBooking, fetchBooking, fetchBookings } from './api'

export const bookingsKeys = {
  all: ['bookings'] as const,
  list: () => [...bookingsKeys.all, 'list'] as const,
  detail: (id: number) => [...bookingsKeys.all, 'detail', id] as const,
}

export function useBookingsQuery() {
  return useQuery({
    queryKey: bookingsKeys.list(),
    queryFn: fetchBookings,
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
