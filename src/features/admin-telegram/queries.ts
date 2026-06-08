/**
 * React Query хуки Telegram VIN-заявок. Источник — пока статический мок
 * (см. api.ts). Контракт хуков не изменится после подключения реального API.
 */
import { useQuery } from '@tanstack/react-query'
import { fetchTelegramRequest, fetchTelegramRequests } from './api'

export const telegramKeys = {
  all: ['telegram-requests'] as const,
  list: () => [...telegramKeys.all, 'list'] as const,
  detail: (id: number) => [...telegramKeys.all, 'detail', id] as const,
}

export function useTelegramRequestsQuery() {
  return useQuery({
    queryKey: telegramKeys.list(),
    queryFn: fetchTelegramRequests,
    staleTime: 60_000,
  })
}

export function useTelegramRequestQuery(id: number | undefined) {
  return useQuery({
    queryKey:
      id !== undefined ? telegramKeys.detail(id) : [...telegramKeys.all, 'detail', 'none'],
    queryFn: () => fetchTelegramRequest(id!),
    enabled: typeof id === 'number' && Number.isFinite(id),
  })
}
