/**
 * API-функции для модуля авторизации клиента.
 * Тонкая обёртка над http: без бизнес-логики, только запросы.
 */
import { http, noAuth } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'
import type {
  ClientLoginRequest,
  ClientProfile,
  ClientRegisterRequest,
  ClientTokenResponse,
} from '@/shared/api/types'

export async function loginClient(payload: ClientLoginRequest) {
  const response = await noAuth<ClientTokenResponse>({
    url: endpoints.clientLogin,
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function registerClient(payload: ClientRegisterRequest) {
  const response = await noAuth<ClientTokenResponse>({
    url: endpoints.clientRegister,
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function fetchClientProfile() {
  const response = await http.get<ClientProfile>(endpoints.clientProfile)
  return response.data
}
