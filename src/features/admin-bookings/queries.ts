/**
 * React Query хуки для админских записей на сервис.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelStaffBooking,
  fetchStaffBooking,
  fetchStaffBookings,
  fetchStaffStations,
  scheduleStaffBooking,
  updateStaffBookingStaffNote,
  updateStaffBookingStation,
  updateStaffBookingStatus,
  updateStaffBookingVin,
} from './api'
import type {
  CancelPayload,
  SchedulePayload,
  StaffBookingsQuery,
  StaffNotePayload,
  StationPayload,
  StatusPayload,
  VinPayload,
} from './types'

export const staffBookingsKeys = {
  all: ['staff-bookings'] as const,
  list: (q?: StaffBookingsQuery) => [...staffBookingsKeys.all, 'list', q ?? {}] as const,
  detail: (id: number) => [...staffBookingsKeys.all, 'detail', id] as const,
}

export function useStaffBookingsQuery(q?: StaffBookingsQuery) {
  return useQuery({
    queryKey: staffBookingsKeys.list(q),
    queryFn: () => fetchStaffBookings(q),
  })
}

export function useStaffBookingQuery(id: number | undefined) {
  return useQuery({
    queryKey:
      id !== undefined
        ? staffBookingsKeys.detail(id)
        : [...staffBookingsKeys.all, 'detail', 'none'],
    queryFn: () => fetchStaffBooking(id!),
    enabled: typeof id === 'number' && Number.isFinite(id),
  })
}

function invalidateBookings(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: staffBookingsKeys.all })
}

export function useCancelStaffBookingMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CancelPayload) => cancelStaffBooking(id, payload),
    onSuccess: () => invalidateBookings(qc),
  })
}

export function useScheduleStaffBookingMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SchedulePayload) => scheduleStaffBooking(id, payload),
    onSuccess: () => invalidateBookings(qc),
  })
}

export function useUpdateStaffNoteMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StaffNotePayload) => updateStaffBookingStaffNote(id, payload),
    onSuccess: () => invalidateBookings(qc),
  })
}

export function useUpdateStationMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StationPayload) => updateStaffBookingStation(id, payload),
    onSuccess: () => invalidateBookings(qc),
  })
}

export function useUpdateStatusMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StatusPayload) => updateStaffBookingStatus(id, payload),
    onSuccess: () => invalidateBookings(qc),
  })
}

export function useUpdateVinMutation(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VinPayload) => updateStaffBookingVin(id, payload),
    onSuccess: () => invalidateBookings(qc),
  })
}

export function useStaffStationsQuery() {
  return useQuery({
    queryKey: ['staff-stations'],
    queryFn: fetchStaffStations,
    staleTime: 5 * 60 * 1000,
  })
}
