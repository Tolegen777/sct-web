import { useQuery } from '@tanstack/react-query'
import { fetchDefaultService, fetchPackage, fetchPackages } from './api'
import { useAuthStore } from '@/features/auth/store'

export const packagesKeys = {
  all: ['packages'] as const,
  list: () => [...packagesKeys.all, 'list'] as const,
  detail: (id: number) => [...packagesKeys.all, 'detail', id] as const,
  defaultDetail: (id: number) => [...packagesKeys.all, 'default', id] as const,
}

export function usePackagesQuery() {
  // Сейчас /client_endpoints/packages/ требует JWT — без него 401. Это
  // обсуждаемо с бэком (см. BACKEND_NOTES), но фронт чтобы не шуметь
  // 401-ками — не запрашивает у гостя.
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  return useQuery({
    queryKey: packagesKeys.list(),
    queryFn: fetchPackages,
    staleTime: 5 * 60_000,
    enabled: isAuthed,
  })
}

export function usePackageQuery(id: number | undefined) {
  // Детальная страница пакета тоже требует JWT.
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  return useQuery({
    queryKey: id !== undefined ? packagesKeys.detail(id) : ['packages', 'detail', 'none'],
    queryFn: () => fetchPackage(id!),
    enabled: isAuthed && typeof id === 'number' && Number.isFinite(id),
  })
}

export function useDefaultServiceQuery(id: number | undefined) {
  // Дефолтная услуга — /packages/default-services/{id}/, тоже требует JWT.
  const isAuthed = useAuthStore((s) => s.phase === 'authed')
  return useQuery({
    queryKey:
      id !== undefined ? packagesKeys.defaultDetail(id) : ['packages', 'default', 'none'],
    queryFn: () => fetchDefaultService(id!),
    enabled: isAuthed && typeof id === 'number' && Number.isFinite(id),
  })
}
