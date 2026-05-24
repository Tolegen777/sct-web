import { staffHttp } from '@/shared/api/staff-http'
import { endpoints } from '@/shared/api/endpoints'
import type { PackagesListPageData, PackagesListQuery } from './types'
import type { PackageDetailPageData } from './detail-types'
import type { StaffServicePackageDetail } from '@/shared/api/types'

export async function fetchPackagesListPageData(q: PackagesListQuery): Promise<PackagesListPageData> {
  const params = clean(q as Record<string, unknown>)
  const response = await staffHttp.get<PackagesListPageData>(
    endpoints.staffPackagesListPageData,
    { params },
  )
  return response.data
}

/** Удаляем пустые поля query, чтобы не слать ?status=&category=&... */
function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = v
  }
  return out
}

export async function fetchPackageDetailPageData(id: number) {
  const response = await staffHttp.get<PackageDetailPageData>(
    endpoints.staffPackageDetailPageData(id),
  )
  return response.data
}

export async function deletePackage(id: number) {
  await staffHttp.delete(endpoints.staffPackageDelete(id))
}

export async function duplicatePackage(id: number) {
  const response = await staffHttp.post<StaffServicePackageDetail>(
    endpoints.staffPackageDuplicate(id),
  )
  return response.data
}
