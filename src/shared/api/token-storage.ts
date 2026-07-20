/**
 * Хранилище JWT-токенов клиентской сессии.
 *
 * Сейчас используется localStorage — этого достаточно для MVP. Если потом
 * перейдём на httpOnly cookies (безопаснее против XSS), меняем только этот
 * файл, остальной код не трогаем.
 *
 * Примечание: раньше здесь жила ещё и staff-сессия (админка). Админку вынесли
 * в отдельный проект (sct-admin) на свой домен, поэтому тут остался только
 * client-scope.
 */

const KEYS = { access: 'sct_client_access', refresh: 'sct_client_refresh' }

function makeStorage() {
  const { access, refresh } = KEYS
  return {
    getAccess(): string | null {
      return localStorage.getItem(access)
    },
    getRefresh(): string | null {
      return localStorage.getItem(refresh)
    },
    setTokens(accessValue: string, refreshValue: string): void {
      localStorage.setItem(access, accessValue)
      localStorage.setItem(refresh, refreshValue)
    },
    setAccess(value: string): void {
      localStorage.setItem(access, value)
    },
    clear(): void {
      localStorage.removeItem(access)
      localStorage.removeItem(refresh)
    },
    hasSession(): boolean {
      return Boolean(localStorage.getItem(access))
    },
  }
}

export const tokenStorage = makeStorage()

// Алиас для явного «client»-именования на месте использования.
export const clientTokens = tokenStorage
