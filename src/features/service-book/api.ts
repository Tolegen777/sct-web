import { http } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type { ServiceBookPageData, ServiceBookQuery } from './types'

export async function fetchServiceBook(q: ServiceBookQuery): Promise<ServiceBookPageData> {
  const response = await http.get<ServiceBookPageData>(endpoints.serviceBookPageData, {
    params: q,
  })
  return response.data
}
