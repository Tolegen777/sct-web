/**
 * Восстановление пароля по SMS — новый контракт бэка (2 эндпоинта).
 *
 *   request/  { phone }                       → всегда одинаковый ответ
 *                                               (даже если номера нет).
 *   confirm/  { phone, code, new_password }   → успех. JWT НЕ возвращается —
 *                                               после смены пароля пользователь
 *                                               логинится сам.
 *
 * Оба вызова — без авторизации (noAuth): пользователь по определению не
 * залогинен.
 */
import { noAuth } from '@/shared/api/http'
import { endpoints } from '@/shared/api/endpoints'

export interface ResetRequestPayload {
  phone: string
}

export interface ResetConfirmPayload {
  phone: string
  code: string
  new_password: string
}

export async function requestPasswordReset(payload: ResetRequestPayload) {
  const response = await noAuth({
    url: endpoints.clientPasswordResetRequest,
    method: 'POST',
    data: payload,
  })
  return response.data
}

export async function confirmPasswordReset(payload: ResetConfirmPayload) {
  const response = await noAuth({
    url: endpoints.clientPasswordResetConfirm,
    method: 'POST',
    data: payload,
  })
  return response.data
}
