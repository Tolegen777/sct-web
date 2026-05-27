/**
 * Карта со всеми филиалами через Yandex Map Widget.
 *
 * Используем iframe-виджет — без API-ключа, без подгрузки JS-библиотеки,
 * 0 KB к бандлу. Минусы: меньше кастомизации (нельзя сделать свой стиль
 * маркеров с логотипом SCT). Но для MVP — хватает.
 *
 * URL формат:
 *   https://yandex.kz/map-widget/v1/?ll=<lon>,<lat>&z=<zoom>
 *     &pt=<lon>,<lat>,<style>~<lon>,<lat>,<style>...
 *
 * Стили маркеров:
 *   pm2blm — синий с буквой M (используем для филиалов)
 *
 * Центрируем по среднему между всеми координатами; зум подбираем
 * автоматически: если все филиалы в одном городе — z=11, если в разных —
 * z=5 для Казахстана целиком.
 */
import { useMemo } from 'react'
import type { ServiceStation } from './types'

interface BranchesMapProps {
  stations: ServiceStation[]
  className?: string
}

export function BranchesMap({ stations, className }: BranchesMapProps) {
  const url = useMemo(() => buildYandexUrl(stations), [stations])

  if (!url) {
    return null
  }

  return (
    <div
      className={
        className ??
        'aspect-[16/7] overflow-hidden rounded-sct-lg border border-borderLight bg-surfaceLight'
      }
    >
      <iframe
        src={url}
        title="Карта филиалов SCT Service"
        loading="lazy"
        className="h-full w-full"
        // sandbox без allow-scripts ломает Yandex — он сам JS грузит.
        // Указываем минимум allow-same-origin + allow-scripts.
        // (отказ от allow-top-navigation и allow-forms для безопасности)
        // sandbox оставлен открытым — иначе виджет не работает.
        allow="geolocation"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}

function buildYandexUrl(stations: ServiceStation[]): string | null {
  const points = stations
    .filter((s) => s.latitude && s.longitude)
    .map((s) => ({
      lat: Number(s.latitude),
      lon: Number(s.longitude),
    }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))

  if (points.length === 0) return null

  // Центрируем на medians (среднее по координатам)
  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length
  const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length

  // Автозум: если разброс координат больше ~2° — это разные города,
  // показываем шире.
  const latRange = Math.max(...points.map((p) => p.lat)) - Math.min(...points.map((p) => p.lat))
  const lonRange = Math.max(...points.map((p) => p.lon)) - Math.min(...points.map((p) => p.lon))
  const range = Math.max(latRange, lonRange)
  let zoom = 11
  if (range > 0.3) zoom = 9
  if (range > 1) zoom = 6
  if (range > 5) zoom = 5

  // Маркеры через `pt`. Координаты в порядке lon,lat (Yandex так).
  const ptParam = points
    .map((p) => `${p.lon.toFixed(6)},${p.lat.toFixed(6)},pm2blm`)
    .join('~')

  return `https://yandex.kz/map-widget/v1/?ll=${avgLon.toFixed(6)},${avgLat.toFixed(6)}&z=${zoom}&pt=${ptParam}`
}
