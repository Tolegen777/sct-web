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

/**
 * Обновление профиля клиента. ВНИМАНИЕ: бэк сейчас отвечает 405 на PATCH
 * (BACKEND_NOTES §4.3) — форма готова, заработает после подключения ручки.
 * `phone` намеренно не отправляем: смена телефона требует SMS-подтверждения.
 */
export async function updateClientProfile(
  payload: Partial<{
    first_name: string
    last_name: string
    middle_name: string
    email: string | null
    date_of_birth: string | null
    password: string
  }>,
) {
  const response = await http.patch<ClientProfile>(endpoints.clientProfile, payload)
  return response.data
}
