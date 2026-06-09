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

/** Ответ /package-items/search/ — бэк сам нормализует и делает fuzzy-поиск. */
export interface PackageItemSearchResponse {
  query: string
  normalized_query: string
  count: number
  results: StaffPackageItemDetail[]
}

/**
 * Поиск товаров/услуг для добавления в состав пакета.
 *
 * Дёргает выделенный fuzzy-эндпоинт `/package-items/search/?q=&limit=`:
 * нормализация (O.E.M. → oem), опечатки (malonn → MANNOL), поиск по
 * названию/бренду/артикулу делает БЭК. Клиент НЕ фильтрует сам.
 */
export async function searchPackageItems(query: string, limit = 20) {
  const q = query.trim()
  if (q.length < 2) return []
  const response = await staffHttp.get<PackageItemSearchResponse>(
    endpoints.staffPackageItemsSearch,
    { params: { q, limit } },
  )
  return response.data.results ?? []
}
