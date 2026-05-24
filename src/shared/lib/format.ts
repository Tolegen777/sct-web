/**
 * Форматирование значений для UI.
 */
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Бэк отдаёт денежные значения как строки в стиле DRF Decimal ("15400.00").
 * Парсим в число и форматируем как KZT для ru-RU.
 *
 * Пустые/невалидные значения превращаем в '—', чтобы не показывать клиенту
 * "NaN ₸".
 */
export function formatMoney(value: string | number | null | undefined, currency = 'KZT'): string {
  if (value === null || value === undefined || value === '') return '—'
  const num = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(num)) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Форматирование пробега: 123456 → "123 456 км".
 */
export function formatMileage(km: number | null | undefined): string {
  if (km === null || km === undefined) return '—'
  return `${new Intl.NumberFormat('ru-RU').format(km)} км`
}

/**
 * ISO дата → "12 Апр 2026".
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'd MMM yyyy', { locale: ru })
  } catch {
    return '—'
  }
}

/**
 * ISO дата+время → "12 Апр, 14:30".
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), 'd MMM, HH:mm', { locale: ru })
  } catch {
    return '—'
  }
}

/**
 * Маска госномера: убираем лишние пробелы, переводим в верхний регистр.
 * Сам ввод не блокируем (бэк сам валидирует по pattern), просто причёсываем.
 */
export function normalizeLicensePlate(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toUpperCase()
}

/**
 * Маска телефона для отображения: +7 (XXX) XXX-XX-XX → +7 XXX XXX XX XX
 * НЕ конвертирует на лету при вводе — это задача input mask библиотеки.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length !== 11) return phone
  const [c, a, b, d, e] = [
    digits[0],
    digits.slice(1, 4),
    digits.slice(4, 7),
    digits.slice(7, 9),
    digits.slice(9, 11),
  ]
  return `+${c} ${a} ${b} ${d} ${e}`
}
