import { useQuery } from '@tanstack/react-query'
import { fetchPackage, fetchPackages } from './api'

export const packagesKeys = {
  all: ['packages'] as const,
  list: () => [...packagesKeys.all, 'list'] as const,
  detail: (id: number) => [...packagesKeys.all, 'detail', id] as const,
}

export function usePackagesQuery() {
  return useQuery({
    queryKey: packagesKeys.list(),
    queryFn: fetchPackages,
    staleTime: 5 * 60_000,
  })
}

export function usePackageQuery(id: number | undefined) {
  return useQuery({
    queryKey: id !== undefined ? packagesKeys.detail(id) : ['packages', 'detail', 'none'],
    queryFn: () => fetchPackage(id!),
    enabled: typeof id === 'number' && Number.isFinite(id),
  })
}
