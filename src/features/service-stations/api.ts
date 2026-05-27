import { http } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  ServiceStation,
  ServiceStationsQuery,
  ServiceStationsResponse,
} from './types'

export async function fetchServiceStations(q: ServiceStationsQuery = {}) {
  const response = await http.get<ServiceStationsResponse>(endpoints.serviceStations, {
    params: clean(q as Record<string, unknown>),
  })
  return response.data
}

export async function fetchServiceStation(id: number, days?: number) {
  const response = await http.get<ServiceStation>(endpoints.serviceStation(id), {
    params: days ? { days } : undefined,
  })
  return response.data
}

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = v
  }
  return out
}
