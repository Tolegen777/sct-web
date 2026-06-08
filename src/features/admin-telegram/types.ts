/**
 * Типы Telegram VIN-заявок (админ-раздел).
 *
 * Сотрудник «Касса SCT» через TG-бота шлёт фото госномера и фото VIN под
 * стеклом. Менеджер в админке вводит госномер → ищет авто клиента → вводит
 * VIN → присваивает VIN автомобилю.
 *
 * ВНИМАНИЕ: бэк-API пока не задеплоен на демо (все пути 404, схема закрыта),
 * раздел работает на статических мок-данных. Контракт восстановлен по
 * мокапам (~/Downloads/list.html, detail_full.html) и HANDOFF.
 */

export type TelegramStatus = 'new' | 'in_progress' | 'car_found' | 'done' | 'problem' | string
export type VinStatus = 'ok' | 'missing' | 'invalid' | string

export interface TelegramFoundCar {
  id: number
  title: string
  plate: string
  vin: string | null
}

export interface TelegramEvent {
  at: string
  title: string
  text?: string
}

export interface TelegramRequest {
  id: number
  created_at: string
  /** Фото госномера из Telegram (URL). */
  plate_photo_url: string | null
  /** Фото VIN под стеклом (URL). */
  vin_photo_url: string | null
  /** Введённый менеджером госномер. */
  entered_plate: string
  /** Введённый менеджером VIN. */
  entered_vin: string
  vin_status: VinStatus
  found_car: TelegramFoundCar | null
  telegram_username: string
  telegram_chat_id: string
  telegram_user_id: string
  status: TelegramStatus
  staff_comment: string
  events: TelegramEvent[]
}

export const TELEGRAM_STATUS_META: Record<string, { label: string; tone: string }> = {
  new: { label: 'Новая', tone: 'bg-blue-50 text-brandBlue' },
  in_progress: { label: 'В работе', tone: 'bg-amber-50 text-amber-700' },
  car_found: { label: 'Авто найдено', tone: 'bg-indigo-50 text-indigo-700' },
  done: { label: 'Готово', tone: 'bg-green-50 text-green-700' },
  problem: { label: 'Проблема', tone: 'bg-rose-50 text-rose-700' },
}

export const TELEGRAM_STATUS_ORDER: TelegramStatus[] = [
  'new',
  'in_progress',
  'car_found',
  'done',
  'problem',
]
