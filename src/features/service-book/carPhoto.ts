/**
 * Фото автомобиля по его id.
 *
 * Единственный источник снимков — `service-book/page-data` → `cars[].image_url`.
 * В `/garage/cars/` фотографии нет вовсе: там внутри `car` лежит только сводка
 * о модификации, и раньше getCarPhoto из-за этого падал на `mark.logo_url` —
 * отсюда и брались кружки BMW/VW вместо машин, на которые жаловался заказчик.
 * Логотип как фолбэк убран, а чтобы экраны не остались с пустыми плашками,
 * фото берём отсюда (тот же приём, что и в мобильном приложении).
 *
 * Запрос уже в кэше на всех экранах, где нужны фото (главная, сервисная
 * книжка, гараж, редактирование), так что обращений к сети это не добавляет.
 */
import { useServiceBookQuery } from './queries'

export function useCarPhoto(carId: number | undefined): string | null {
  const { data } = useServiceBookQuery({})
  if (carId == null) return null
  return (data?.cars ?? []).find((c) => c.id === carId)?.image_url ?? null
}
