/**
 * API формы редактирования пакета.
 *
 * Эндпоинты:
 *   GET    /staff_endpoints/packages/{id}/         — для предзаполнения формы
 *   POST   /staff_endpoints/packages/create/       — создание
 *   PATCH  /staff_endpoints/packages/{id}/edit/    — частичное обновление
 *   GET    /staff_endpoints/packages/package-items/?autocomplete=1&q=...
 *                                                  — поиск товаров/услуг для состава
 */
import { staffHttp } from '@/shared/api/staff-http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  StaffServicePackageDetail,
  StaffServicePackageWriteRequest,
  PatchedStaffServicePackageWriteRequest,
  StaffPackageItemDetail,
} from '@/shared/api/types'

export async function fetchPackageForEdit(id: number) {
  const response = await staffHttp.get<StaffServicePackageDetail>(endpoints.staffPackage(id))
  return response.data
}

export async function createPackage(payload: StaffServicePackageWriteRequest) {
  const response = await staffHttp.post<StaffServicePackageDetail>(
    endpoints.staffPackagesCreate,
    payload,
  )
  return response.data
}

export async function updatePackage(
  id: number,
  payload: PatchedStaffServicePackageWriteRequest,
) {
  const response = await staffHttp.patch<StaffServicePackageDetail>(
    endpoints.staffPackageEdit(id),
    payload,
  )
  return response.data
}

export interface PackageItemSearchResult {
  results?: StaffPackageItemDetail[]
}

/**
 * Поиск товаров/услуг для добавления в состав пакета.
 * Используется в автокомплите. В paginate=false режиме возвращает массив,
 * в обычном — { results }.
 */
export async function searchPackageItems(query: string) {
  if (!query.trim()) return []
  const response = await staffHttp.get<
    PackageItemSearchResult | StaffPackageItemDetail[]
  >(endpoints.staffPackageItems, {
    params: {
      autocomplete: 1,
      q: query,
      page_size: 20,
    },
  })
  const data = response.data
  if (Array.isArray(data)) return data
  return data.results ?? []
}
