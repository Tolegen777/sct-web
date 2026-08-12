import { env } from '@/shared/config/env'

/**
 * Приводит медиа-URL от бэка к абсолютному.
 *
 * Бэк иногда отдаёт относительные пути (напр. `/media/cars/mark_logos/AUDI.png`).
 * <img src> резолвит их на домен фронта, а не бэка → SPA-фолбэк отдаёт index.html
 * вместо картинки → битое изображение. Достраиваем такие пути через `API_BASE_URL`.
 *
 * Трогаем ТОЛЬКО пути бэкового медиа (`/media/...`). Абсолютные URL (http/https,
 * protocol-relative, data:) и локальные ассеты фронта (`/logo.svg`, `/hero-*.jpg`)
 * оставляем как есть.
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (/^(?:https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  if (url.startsWith('/media/')) {
    return env.API_BASE_URL.replace(/\/+$/, '') + url
  }
  return url
}
