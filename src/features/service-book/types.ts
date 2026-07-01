/**
 * Runtime-типы для ответа /service-book/page-data/.
 *
 * В OpenAPI schema эти структуры описаны как `additionalProperties {}`,
 * то есть форма не зафиксирована. Восстановил по реальному ответу сервера
 * (проба: 2026-05-24, авторизованный клиент с 3 авто и одной активной записью).
 *
 * Все опциональные поля помечены как `| null` или через `?`, чтобы
 * не упасть, если бэк начнёт что-то не присылать.
 */

export type PageState =
  | 'NO_CARS'
  | 'NO_SERVICE_HISTORY'
  | 'HAS_ACTIVE_APPOINTMENTS'
  | 'HAS_SERVICE_HISTORY'

export type AppointmentStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | string // на всякий случай — бэк может добавить свои
export type AppointmentType = 'active' | 'past' | 'cancelled' | string

export interface MoneyValue {
  amount: string
  currency: string
  display: string
}

export interface ClientInfo {
  id: number
  full_name: string
  phone: string
  email: string | null
  cars_count: number
  has_cars: boolean
}

export interface CarMark {
  id: number
  source_id: string
  name: string
  display_name: string
  logo_url: string
}

export interface CarModel {
  id: number
  source_id: string
  name: string
  display_name: string
}

export interface CarGeneration {
  id: number
  source_id: string
  name: string
  display_name: string
  year_from: number
  year_to: number
}

export interface CarConfiguration {
  id: number
  source_id: string
  name: string
  body_type: string
  doors_count: number
}

export interface CarModification {
  id: number
  source_id: string
  name: string
  group_name: string
  full_title: string
}

export interface CarUrls {
  garage_detail_api: string
  garage_edit_api: string
  garage_set_default_api: string
}

export interface ServiceBookCar {
  id: number
  display_name: string
  full_car_title: string
  license_plate: string
  vin_code: string | null
  nickname: string
  is_default: boolean
  status: string
  status_label: string
  latest_mileage_km: number | null
  image_url: string | null
  mark: CarMark
  model: CarModel
  generation: CarGeneration | null
  configuration: CarConfiguration | null
  modification: CarModification | null
  urls?: CarUrls
}

export interface AppointmentCarRef {
  id: number
  title: string
  license_plate: string
}

export interface AppointmentPackage {
  id: number
  title: string
  price: string | null
  currency: string
  display_price: string
}

/** Унифицированный объект услуги визита (пакет ИЛИ дефолтная). */
export interface AppointmentService {
  source_type?: 'service_package' | 'default_service_page' | string
  id?: number
  title?: string
  slug?: string
  price?: string | null
  currency?: string
  display_price?: string
}

export interface AppointmentUrls {
  detail_api: string
  edit_api: string
  repeat_api: string
}

export interface Appointment {
  id: number
  status: AppointmentStatus
  status_label: string
  type: AppointmentType
  preferred_datetime: string | null
  scheduled_datetime: string | null
  final_datetime: string | null
  address: string
  comment: string
  cancel_reason: string
  is_active: boolean
  is_cancelled: boolean
  can_cancel: boolean
  can_repeat: boolean
  car: AppointmentCarRef
  /** Унифицированный объект услуги (пакет ИЛИ дефолтная). */
  service?: AppointmentService | null
  service_package?: AppointmentPackage | null
  urls: AppointmentUrls
}

export interface ServiceBookSummary {
  cars_count: number
  appointments_total: number
  active_appointments_count: number
  completed_appointments_count: number
  cancelled_appointments_count: number
  /**
   * Бэк убрал total_spent/last_service_date/next_service_date и заменил их
   * этими флагами (сверено на dev 2026-07-01, ждём подтверждения, что формат
   * финальный).
   */
  has_active_appointments: boolean
  has_service_history: boolean
}

export interface FilterOption {
  value: string
  label: string
}

export interface ServiceBookFilters {
  status: string
  period: string
  available_statuses: FilterOption[]
  available_periods: FilterOption[]
}

export interface ServiceBookActions {
  add_car_url: string
  garage_url: string
  book_service_url: string
  page_api: string
  bookings_list_api: string
  create_booking_api: string
}

export interface ServiceBookMeta {
  limit: number
  offset: number
  count: number
  has_more: boolean
}

/**
 * Один элемент service_recommendations.recommendations[].
 *
 * Форма пока НЕ подтверждена бэком — на dev (2026-07-01) массив приходит
 * пустым. Поля опциональные, чтобы ничего не сломать; уточняется у бэкенда.
 */
export interface ServiceRecommendationItem {
  type?: string
  title?: string
  message?: string
  [key: string]: unknown
}

/**
 * Новый формат service_recommendations (сверено на dev 2026-07-01).
 *
 * Бэк убрал объект engine_oil: теперь рекомендация по маслу — это целевой
 * пробег next_oil_change_mileage_km (не дата!), а recommendations[] — общий
 * список рекомендаций (пока приходит пустым).
 */
export interface ServiceRecommendations {
  latest_mileage_km: number | null
  next_oil_change_mileage_km: number | null
  recommendations: ServiceRecommendationItem[]
}

export interface ServiceBookPageData {
  page_state: PageState
  client: ClientInfo
  cars: ServiceBookCar[]
  selected_car: ServiceBookCar | null
  service_recommendations?: ServiceRecommendations | null
  summary: ServiceBookSummary
  next_appointment: Appointment | null
  appointments: Appointment[]
  filters: ServiceBookFilters
  actions: ServiceBookActions
  empty_state: unknown
  meta: ServiceBookMeta
}

/**
 * Параметры query string для /service-book/page-data/.
 */
export interface ServiceBookQuery {
  car_id?: number
  status?: string
  period?: string
  limit?: number
  offset?: number
}
