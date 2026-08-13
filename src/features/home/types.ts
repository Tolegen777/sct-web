/**
 * Публичная «акция месяца» для промо-баннера на главной.
 * Источник: GET /api/v1/public/home-promotion/ (без авторизации),
 * редактируется из админки бэка. Конверт { success, message, data: { promotion } }
 * разворачивается в http-интерсепторе → в код приходит уже { promotion }.
 */
export interface HomePromotion {
  id: number
  /** Плашка над заголовком, напр. «Акция месяца». */
  label: string
  title: string
  description: string
  /** ISO-строка окончания акции — под обратный отсчёт. */
  deadline: string
  primary_button_text: string
  primary_button_url: string
  secondary_button_text: string
  secondary_button_url: string
  is_active: boolean
  is_expired: boolean
  updated_at: string
}
