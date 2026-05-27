import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchServiceStation, fetchServiceStations } from './api'
import { useAuthStore } from '@/features/auth/store'
import type { ServiceStationsQuery } from './types'

export const stationsKeys = {
  all: ['service-stations'] as const,
  list: (q: ServiceStationsQuery) => [...stationsKeys.all, 'list', q] as const,
  detail: (id: number, days?: number) =>
    [...stationsKeys.all, 'detail', id, days ?? null] as const,
}

export function useServiceStationsQuery(q: ServiceStationsQuery = {}) {
  // Сейчас бэк требует JWT даже для филиалов — поэтому для гостя запрос
  // не шлём. Идеологически филиалы должны быть public (страница «Контакты»
  // должна работать без логина) — это отмечено в BACKEND_NOTES.
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  return useQuery({
    queryKey: stationsKeys.list(q),
    queryFn: () => fetchServiceStations(q),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    enabled: isAuthed,
  })
}

export function useServiceStationQuery(id: number | undefined, days?: number) {
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  return useQuery({
    queryKey:
      id !== undefined ? stationsKeys.detail(id, days) : ['service-stations', 'detail', 'none'],
    queryFn: () => fetchServiceStation(id!, days),
    enabled: isAuthed && typeof id === 'number' && Number.isFinite(id),
  })
}
