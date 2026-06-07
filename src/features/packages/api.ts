import { http } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type { ClientServicePackage } from '@/shared/api/types'
import type { ClientDefaultServicePage, PackagesPageData } from './types'

export async function fetchPackages() {
  // Свежая схема возвращает active_car + regular/promotional + default_services.
  const response = await http.get<PackagesPageData>(endpoints.packages)
  return response.data
}

export async function fetchPackage(id: number) {
  const response = await http.get<ClientServicePackage>(endpoints.package(id))
  return response.data
}

export async function fetchDefaultService(id: number) {
  const response = await http.get<ClientDefaultServicePage>(
    endpoints.defaultService(id),
  )
  return response.data
}
