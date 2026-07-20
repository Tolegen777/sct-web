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
import { RequireAuth } from '@/app/RequireAuth'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ServicesPage = lazy(() => import('@/pages/ServicesPage'))
const ServiceInfoPage = lazy(() => import('@/pages/ServiceInfoPage'))
const PackageDetailPage = lazy(() => import('@/pages/PackageDetailPage'))
const ServiceBookPage = lazy(() => import('@/pages/ServiceBookPage'))
const GaragePage = lazy(() => import('@/pages/GaragePage'))
const AddCarPage = lazy(() => import('@/pages/AddCarPage'))
const EditCarPage = lazy(() => import('@/pages/EditCarPage'))
const ContactsPage = lazy(() => import('@/pages/ContactsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const BookingDetailPage = lazy(() => import('@/pages/BookingDetailPage'))
const BookServicePage = lazy(() => import('@/pages/BookServicePage'))
const DefaultServiceDetailPage = lazy(() => import('@/pages/DefaultServiceDetailPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Публичные
      { path: '/', element: <HomePage /> },
      { path: '/services', element: <ServicesPage /> },
      { path: '/services/info/:code', element: <ServiceInfoPage /> },
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
          { path: '/profile', element: <ProfilePage /> },
          { path: '/service-book', element: <ServiceBookPage /> },
          { path: '/garage', element: <GaragePage /> },
          { path: '/garage/add', element: <AddCarPage /> },
          { path: '/garage/edit/:id', element: <EditCarPage /> },
          { path: '/services/:id/book', element: <BookServicePage /> },
          { path: '/services/default/:id', element: <DefaultServiceDetailPage /> },
          { path: '/bookings/:id', element: <BookingDetailPage /> },
        ],
      },

      // Алиасы / 404
      { path: '/home', element: <Navigate to="/" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
