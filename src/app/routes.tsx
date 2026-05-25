/**
 * Главный роутер приложения.
 *
 * Структура:
 *   /                — Главная (лендинг + dashboard для залогиненных)
 *   /services        — Список услуг (для активного авто)
 *   /services/:id    — Деталь пакета
 *   /service-book    — Сервисная книжка (защищённый)
 *   /garage          — Гараж клиента (защищённый)
 *   /garage/add      — Конфигуратор добавления авто (защищённый)
 *   /garage/edit/:id — Редактирование авто (защищённый)
 *   /contacts        — Контакты (статика)
 *   *                — 404
 */
import { lazy } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { Layout } from '@/app/Layout'
import { StaffLayout } from '@/app/StaffLayout'
import { RequireAuth } from '@/app/RequireAuth'
import { RequireStaff } from '@/app/RequireStaff'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const PackageDetailPage = lazy(() => import('@/pages/PackageDetailPage'))
const ServiceBookPage = lazy(() => import('@/pages/ServiceBookPage'))
const GaragePage = lazy(() => import('@/pages/GaragePage'))
const AddCarPage = lazy(() => import('@/pages/AddCarPage'))
const EditCarPage = lazy(() => import('@/pages/EditCarPage'))
const ContactsPage = lazy(() => import('@/pages/ContactsPage'))
const BookingDetailPage = lazy(() => import('@/pages/BookingDetailPage'))
const BookServicePage = lazy(() => import('@/pages/BookServicePage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

const StaffLoginPage = lazy(() => import('@/pages/admin/StaffLoginPage'))
const AdminPackagesPage = lazy(() => import('@/pages/admin/AdminPackagesPage'))
const AdminPackageDetailPage = lazy(() => import('@/pages/admin/AdminPackageDetailPage'))
const AdminPackageEditPage = lazy(() => import('@/pages/admin/AdminPackageEditPage'))
const AdminCarsPage = lazy(() => import('@/pages/admin/AdminCarsPage'))

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Публичные
      { path: '/', element: <HomePage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/services/:id', element: <PackageDetailPage /> },
      { path: '/contacts', element: <ContactsPage /> },

      // Защищённые — оборачиваем общим guard'ом
      {
        element: (
          <RequireAuth>
            <Outlet />
          </RequireAuth>
        ),
        children: [
          { path: '/service-book', element: <ServiceBookPage /> },
          { path: '/garage', element: <GaragePage /> },
          { path: '/garage/add', element: <AddCarPage /> },
          { path: '/garage/edit/:id', element: <EditCarPage /> },
          { path: '/services/:id/book', element: <BookServicePage /> },
          { path: '/bookings/:id', element: <BookingDetailPage /> },
        ],
      },

      // Алиасы / 404
      { path: '/home', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // === Админка ===
  // Логин — отдельной страницей без StaffLayout (header админки показывать
  // нет смысла, пока стафф не вошёл).
  { path: '/admin/login', element: <StaffLoginPage /> },
  {
    path: '/admin',
    element: (
      <RequireStaff>
        <StaffLayout />
      </RequireStaff>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/packages" replace /> },
      { path: 'packages', element: <AdminPackagesPage /> },
      { path: 'packages/new', element: <AdminPackageEditPage /> },
      { path: 'packages/:id', element: <AdminPackageDetailPage /> },
      { path: 'packages/:id/edit', element: <AdminPackageEditPage /> },
      { path: 'cars', element: <AdminCarsPage /> },
    ],
  },
])
