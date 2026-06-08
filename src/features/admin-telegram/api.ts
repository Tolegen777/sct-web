/**
 * Data-слой Telegram VIN-заявок.
 *
 * ⚠️ ВРЕМЕННО НА СТАТИКЕ. Реальный бэк-API ещё не задеплоен на демо
 * (все пути 404, /api/schema/ закрыт). Когда бэкендщик пришлёт точные пути —
 * заменить тело функций на staffHttp-запросы, напр.:
 *
 *   const { data } = await staffHttp.get('/api/v1/staff_endpoints/telegram_vehicle_requests/')
 *   return data.results ?? data
 *
 * и detail:
 *   staffHttp.get(`/api/v1/staff_endpoints/telegram_vehicle_requests/${id}/`)
 *
 * Остальной код (страницы, queries) трогать не придётся — контракт тот же.
 */
import type { TelegramRequest } from './types'

const MOCK: TelegramRequest[] = [
  {
    id: 190,
    created_at: '2026-06-07T09:12:00+05:00',
    plate_photo_url: null,
    vin_photo_url: null,
    entered_plate: '',
    entered_vin: '',
    vin_status: 'missing',
    found_car: null,
    telegram_username: '@kassa_sct',
    telegram_chat_id: '480012345',
    telegram_user_id: '480012345',
    status: 'new',
    staff_comment: '',
    events: [{ at: '2026-06-07T09:12:00+05:00', title: 'Заявка создана', text: 'Telegram-бот получил фото госномера и VIN.' }],
  },
  {
    id: 189,
    created_at: '2026-06-06T12:20:00+05:00',
    plate_photo_url: null,
    vin_photo_url: null,
    entered_plate: '847ATB02',
    entered_vin: '',
    vin_status: 'missing',
    found_car: { id: 41, title: 'Hyundai Tucson III', plate: '847ATB02', vin: null },
    telegram_username: '@kassa_sct',
    telegram_chat_id: '480012345',
    telegram_user_id: '480012345',
    status: 'car_found',
    staff_comment: 'Госномер распознан, авто найдено в базе. Жду присвоения VIN.',
    events: [
      { at: '2026-06-06T12:20:00+05:00', title: 'Заявка создана', text: 'Telegram-бот получил фото госномера и VIN.' },
      { at: '2026-06-06T12:31:00+05:00', title: 'Госномер введён', text: '847ATB02' },
      { at: '2026-06-06T12:33:00+05:00', title: 'Автомобиль найден', text: 'Hyundai Tucson III' },
    ],
  },
  {
    id: 188,
    created_at: '2026-06-05T16:05:00+05:00',
    plate_photo_url: null,
    vin_photo_url: null,
    entered_plate: '518NTN04',
    entered_vin: 'JTDBR32E720061234',
    vin_status: 'ok',
    found_car: { id: 25, title: 'Toyota Camry XV70', plate: '518NTN04', vin: 'JTDBR32E720061234' },
    telegram_username: '@manager_aibek',
    telegram_chat_id: '510099887',
    telegram_user_id: '510099887',
    status: 'done',
    staff_comment: 'VIN присвоен, заявка закрыта.',
    events: [
      { at: '2026-06-05T16:05:00+05:00', title: 'Заявка создана' },
      { at: '2026-06-05T16:11:00+05:00', title: 'Госномер введён', text: '518NTN04' },
      { at: '2026-06-05T16:12:00+05:00', title: 'Автомобиль найден', text: 'Toyota Camry XV70' },
      { at: '2026-06-05T16:14:00+05:00', title: 'VIN присвоен автомобилю', text: 'JTDBR32E720061234' },
    ],
  },
  {
    id: 187,
    created_at: '2026-06-05T10:40:00+05:00',
    plate_photo_url: null,
    vin_photo_url: null,
    entered_plate: '999ZZZ01',
    entered_vin: 'XXINVALIDVIN0000',
    vin_status: 'invalid',
    found_car: null,
    telegram_username: '@kassa_sct',
    telegram_chat_id: '480012345',
    telegram_user_id: '480012345',
    status: 'problem',
    staff_comment: 'VIN на фото нечитаемый, авто по госномеру не найдено.',
    events: [
      { at: '2026-06-05T10:40:00+05:00', title: 'Заявка создана' },
      { at: '2026-06-05T10:52:00+05:00', title: 'Отмечена проблема', text: 'VIN нечитаемый, авто не найдено.' },
    ],
  },
  {
    id: 186,
    created_at: '2026-06-04T14:18:00+05:00',
    plate_photo_url: null,
    vin_photo_url: null,
    entered_plate: '126ETX16',
    entered_vin: '',
    vin_status: 'missing',
    found_car: { id: 18, title: 'Kia Rio IV', plate: '126ETX16', vin: null },
    telegram_username: '@manager_aibek',
    telegram_chat_id: '510099887',
    telegram_user_id: '510099887',
    status: 'in_progress',
    staff_comment: '',
    events: [
      { at: '2026-06-04T14:18:00+05:00', title: 'Заявка создана' },
      { at: '2026-06-04T14:25:00+05:00', title: 'Госномер введён', text: '126ETX16' },
    ],
  },
  {
    id: 185,
    created_at: '2026-06-04T08:02:00+05:00',
    plate_photo_url: null,
    vin_photo_url: null,
    entered_plate: '',
    entered_vin: '',
    vin_status: 'missing',
    found_car: null,
    telegram_username: '@kassa_sct',
    telegram_chat_id: '480012345',
    telegram_user_id: '480012345',
    status: 'new',
    staff_comment: 'Фото госномера засвечено — нужен повторный снимок.',
    events: [{ at: '2026-06-04T08:02:00+05:00', title: 'Заявка создана', text: 'Только фото VIN, госномер не распознан.' }],
  },
]

export async function fetchTelegramRequests(): Promise<TelegramRequest[]> {
  // TODO(real-api): staffHttp.get('/api/v1/staff_endpoints/telegram_vehicle_requests/')
  return Promise.resolve(MOCK)
}

export async function fetchTelegramRequest(id: number): Promise<TelegramRequest | null> {
  // TODO(real-api): staffHttp.get(`/api/v1/staff_endpoints/telegram_vehicle_requests/${id}/`)
  return Promise.resolve(MOCK.find((r) => r.id === id) ?? null)
}
