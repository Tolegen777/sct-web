/**
 * Хелперы для пакетов услуг.
 *
 * Бэк присылает title в формате:
 *   "Замена масла в ДВС — Acura | NSX | I Рестайлинг | Купе | 3.0 AT (256 л.с.)"
 * — то есть с прицепом полного имени модификации.
 *
 * На странице услуг машина и так в Hero, в названии она не нужна. Чистим суффикс.
 */
import type { ClientServicePackage } from '@/shared/api/types'

export function getPackageShortTitle(pkg: Pick<ClientServicePackage, 'title' | 'car_title'>): string {
  if (!pkg.title) return ''
  const carPart = pkg.car_title
  if (!carPart) return pkg.title
  // Возможные разделители: «— », « - », « – »
  const separators = [` — ${carPart}`, ` - ${carPart}`, ` – ${carPart}`]
  for (const sep of separators) {
    if (pkg.title.endsWith(sep)) return pkg.title.slice(0, pkg.title.length - sep.length)
  }
  return pkg.title
}
