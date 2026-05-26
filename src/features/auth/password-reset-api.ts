/**
 * Заготовки API-вызовов для восстановления пароля.
 *
 * Сейчас бэк ещё не реализовал ни одного из трёх эндпоинтов (см.
 * BACKEND_NOTES.md, п. 4.1). Когда подключит — этот файл подключится
 * автоматически. URL'ы и payload'ы я указал предварительные; если бэк
 * назовёт ручки иначе — корректируем в одном месте.
 */
import { http } from '@/shared/api/http'

const URLS = {
  request: '/api/v1/client_endpoints/auth/password-reset/request/',
  verify: '/api/v1/client_endpoints/auth/password-reset/verify/',
  confirm: '/api/v1/client_endpoints/auth/password-reset/confirm/',
} as const

export interface ResetRequestPayload {
  phone: string
}
export interface ResetRequestResponse {
  request_id: string
  ttl?: number
  attempts_left?: number
}

export interface ResetVerifyPayload {
  request_id: string
  code: string
}
export interface ResetVerifyResponse {
  reset_token: string
  ttl?: number
}

export interface ResetConfirmPayload {
  reset_token: string
  new_password: string
}
export interface ResetConfirmResponse {
  access: string
  refresh: string
}

export async function requestPasswordReset(payload: ResetRequestPayload) {
  const response = await http.post<ResetRequestResponse>(URLS.request, payload)
  return response.data
}

export async function verifyPasswordReset(payload: ResetVerifyPayload) {
  const response = await http.post<ResetVerifyResponse>(URLS.verify, payload)
  return response.data
}

export async function confirmPasswordReset(payload: ResetConfirmPayload) {
  const response = await http.post<ResetConfirmResponse>(URLS.confirm, payload)
  return response.data
}
