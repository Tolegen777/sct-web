/**
 * Runtime-типы для /staff_endpoints/packages/list-page-data/.
 *
 * Восстановлены по реальному ответу сервера (2026-05-24). OpenAPI описывает
 * этот эндпоинт без тела ответа, поэтому autogen его не покрыл.
 */

export interface BreadcrumbItem {
  label: string
  key: string
}

export interface TabDef {
  key: string
  label: string
  filter: Record<string, unknown>
}

export interface EmptyState {
  title: string
  description: string
  primary_action?: ActionDef
}

export interface ActionDef {
  label: string
  action: string
}

export interface PageMeta {
  title: string
  subtitle: string
  breadcrumbs: BreadcrumbItem[]
  tabs: TabDef[]
  empty_state: EmptyState
  actions: {
    primary?: ActionDef
    secondary?: ActionDef[]
  }
}

export interface StatItem {
  label: string
  value: number
}

export interface ListStats {
  total: StatItem
  published: StatItem
  promotional: StatItem
  draft: StatItem
}

export interface FilterOption<T = string | number> {
  value: T
  label: string
  count?: number
  // дополнительные поля могут быть (code, slug, icon, color)
  [key: string]: unknown
}

export interface ListFilters {
  package_categories: FilterOption<number>[]
  package_statuses: FilterOption<string>[]
  promotion_options: FilterOption<boolean>[]
  // Авто-фильтры (бэк отдаёт под list-page-data, см. probe от 2026-06-01).
  marks?: FilterOption<number>[]
  models?: FilterOption<number>[]
  generations?: FilterOption<number>[]
  body_types?: FilterOption<number>[]
  powertrain_types?: FilterOption<string>[]
  drive_types?: FilterOption<string>[]
  transmission_types?: FilterOption<string>[]
  [key: string]: unknown
}

export interface AppliedFilters {
  search: string
  category: number | null
  status: string | null
  has_promotion: boolean | null
  mark: number | null
  model: number | null
  generation: number | null
  body_type: number | null
  year: number | null
  powertrain_type: string | null
  drive_type: string | null
  transmission_type: string | null
  power_hp_min: number | null
  power_hp_max: number | null
  displacement_cc_min: number | null
  displacement_cc_max: number | null
  ordering: string
  page: number
  page_size: number
}

export interface Pagination {
  count: number
  page: number
  page_size: number
  total_pages: number
  next: string | null
  previous: string | null
}

export interface PackageImage {
  url: string
  alt: string
}

export interface PackagePrice {
  currency: string
  products_total: string
  services_total: string
  base_total: string
  discount_type: string
  discount_percent: string
  discount_amount: string
  final_price: string
  price_mode: string
}

export interface PackageCategoryShort {
  id: number
  code: string
  name: string
  slug: string
  icon?: string
  color?: string
}

export interface PackageCarSummary {
  modification_source_id: string
  modification_name: string
  modification_group_name: string
  full_title: string
  mark: { id: number; source_id: string; name: string }
  model: { id: number; source_id: string; name: string }
  generation?: {
    id: number
    source_id: string
    name: string
    year_from: number
    year_to: number
  }
  configuration?: {
    id: number
    source_id: string
    name: string
    body_type: { id: number; code: string; name: string }
  }
}

export interface PackageStatusBadge {
  value: string
  label: string
}

export interface PackageListItem {
  id: number
  title: string
  image: PackageImage
  price: PackagePrice
  category: PackageCategoryShort
  car: PackageCarSummary
  status: PackageStatusBadge
  has_promotion: boolean
  promotion_title: string
  created_at: string
  updated_at: string
}

export interface PackagesListPageData {
  page: PageMeta
  stats: ListStats
  filters: ListFilters
  applied_filters: AppliedFilters
  pagination: Pagination
  results: PackageListItem[]
}

/** Query-параметры для list-page-data. */
export interface PackagesListQuery {
  search?: string
  category?: number
  status?: string
  has_promotion?: boolean
  mark?: number
  model?: number
  generation?: number
  body_type?: number
  year?: number
  powertrain_type?: string
  drive_type?: string
  transmission_type?: string
  power_hp_min?: number
  power_hp_max?: number
  displacement_cc_min?: number
  displacement_cc_max?: number
  ordering?: string
  page?: number
  page_size?: 10 | 20 | 50 | 100
}
