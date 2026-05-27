/**
 * Единое место со всеми URL'ами API. Если бэк переименует ручку — правим
 * только тут.
 *
 * Источник: additional/schema.yml + ответы бэкендщика.
 * Список синхронизирован с реальной schema OpenAPI на момент запуска проекта.
 */

export const endpoints = {
  // --- Клиент: авторизация ---
  clientLogin: '/api/v1/client_endpoints/auth/login/',
  clientRegister: '/api/v1/client_endpoints/auth/register/',
  clientRefresh: '/api/v1/client_endpoints/auth/refresh/',
  clientProfile: '/api/v1/client_endpoints/auth/profile/',

  // --- Клиент: гараж ---
  garageCars: '/api/v1/client_endpoints/garage/cars/',
  garageCar: (id: number) => `/api/v1/client_endpoints/garage/cars/${id}/`,
  garageCarSetDefault: (id: number) =>
    `/api/v1/client_endpoints/garage/cars/${id}/set-default/`,
  garageFormPageData: '/api/v1/client_endpoints/garage/form-page-data/',

  // --- Клиент: пакеты ---
  packages: '/api/v1/client_endpoints/packages/',
  package: (id: number) => `/api/v1/client_endpoints/packages/${id}/`,

  // --- Клиент: сервисная книжка ---
  serviceBookPageData: '/api/v1/client_endpoints/service-book/page-data/',

  // --- Клиент: записи на сервис (booking) ---
  // list/detail/create/edit готовы; cancel ещё не подключён бэком.
  bookings: '/api/v1/client_endpoints/service-book/bookings/',
  booking: (id: number) => `/api/v1/client_endpoints/service-book/bookings/${id}/`,
  createBooking: '/api/v1/client_endpoints/service-book/create_booking/',

  // --- Клиент: филиалы (service stations) ---
  // Возвращают список с встроенным расписанием на N дней (по умолчанию 7).
  serviceStations: '/api/v1/client_endpoints/service_stations/',
  serviceStation: (id: number) =>
    `/api/v1/client_endpoints/service_stations/${id}/`,

  // --- Публичный конфигуратор авто (используется в add_car / change) ---
  carsMarks: '/api/v1/cars/marks/',
  carsModels: '/api/v1/cars/models/',
  carsFilters: '/api/v1/cars/filters/',
  carsModifications: '/api/v1/cars/modifications/',

  // --- Staff (для админки пакетов) ---
  staffLogin: '/api/v1/staff_endpoints/auth/login/',
  staffLogout: '/api/v1/staff_endpoints/auth/logout/',
  staffRefresh: '/api/v1/staff_endpoints/auth/refresh/',
  staffProfile: '/api/v1/staff_endpoints/auth/profile/',
  staffPackages: '/api/v1/staff_endpoints/packages/',
  staffPackagesListPageData:
    '/api/v1/staff_endpoints/packages/list-page-data/',
  staffPackagesCreate: '/api/v1/staff_endpoints/packages/create/',
  staffPackage: (id: number) => `/api/v1/staff_endpoints/packages/${id}/`,
  staffPackageEdit: (id: number) =>
    `/api/v1/staff_endpoints/packages/${id}/edit/`,
  staffPackageDelete: (id: number) =>
    `/api/v1/staff_endpoints/packages/${id}/delete/`,
  staffPackageDuplicate: (id: number) =>
    `/api/v1/staff_endpoints/packages/${id}/duplicate/`,
  staffPackageDetailPageData: (id: number) =>
    `/api/v1/staff_endpoints/packages/${id}/detail-page-data/`,
  staffPackagesCarsListPageData:
    '/api/v1/staff_endpoints/packages/cars-list-page-data/',
  staffCarsListPageData: '/api/v1/staff_endpoints/cars/cars-list-page-data/',
  staffCarDetailPageData: (sourceId: string) =>
    `/api/v1/staff_endpoints/cars/${sourceId}/detail-page-data/`,
  staffPackageItems: '/api/v1/staff_endpoints/packages/package-items/',
} as const
