import { http } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  ClientPackagesPage,
  ClientServicePackage,
} from '@/shared/api/types'

export async function fetchPackages() {
  const response = await http.get<ClientPackagesPage>(endpoints.packages)
  return response.data
}

export async function fetchPackage(id: number) {
  const response = await http.get<ClientServicePackage>(endpoints.package(id))
  return response.data
}
