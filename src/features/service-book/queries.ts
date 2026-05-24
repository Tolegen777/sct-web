import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchServiceBook } from './api'
import type { ServiceBookQuery } from './types'

export const serviceBookKeys = {
  all: ['service-book'] as const,
  page: (q: ServiceBookQuery) => [...serviceBookKeys.all, 'page', q] as const,
}

export function useServiceBookQuery(q: ServiceBookQuery) {
  return useQuery({
    queryKey: serviceBookKeys.page(q),
    queryFn: () => fetchServiceBook(q),
    // При смене фильтров не мигаем skeleton'ом — оставляем прошлые данные.
    placeholderData: keepPreviousData,
  })
}
