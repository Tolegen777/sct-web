/**
 * Глобальный auth-store клиента.
 *
 * Содержит профиль и фазу авторизации. Сами токены живут в localStorage
 * через tokenStorage — здесь не дублируем (single source of truth).
 *
 * Фазы:
 *   'idle'      — стартовое состояние сразу после загрузки страницы
 *   'loading'   — пытаемся подтянуть профиль по сохранённому токену
 *   'authed'    — успех, в `profile` есть данные
 *   'guest'    — токена нет / refresh не сработал / 401
 */
import { create } from 'zustand'
import type { ClientProfile } from '@/shared/api/types'
import { tokenStorage } from '@/shared/api/token-storage'
import { fetchClientProfile } from './api'

type AuthPhase = 'idle' | 'loading' | 'authed' | 'guest'

interface AuthState {
  phase: AuthPhase
  profile: ClientProfile | null
  // Хуки UI:
  setSession: (access: string, refresh: string, profile: ClientProfile) => void
  setProfile: (profile: ClientProfile) => void
  logout: () => void
  // Бутстрап на старте приложения: пробуем подтянуть профиль по токену.
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  phase: 'idle',
  profile: null,

  setSession: (access, refresh, profile) => {
    tokenStorage.setTokens(access, refresh)
    set({ phase: 'authed', profile })
  },

  setProfile: (profile) => set({ profile, phase: 'authed' }),

  logout: () => {
    tokenStorage.clear()
    set({ phase: 'guest', profile: null })
  },

  hydrate: async () => {
    if (!tokenStorage.hasSession()) {
      set({ phase: 'guest', profile: null })
      return
    }
    set({ phase: 'loading' })
    try {
      const profile = await fetchClientProfile()
      set({ phase: 'authed', profile })
    } catch {
      // 401 уже пытался рефрешнуться внутри http-interceptor'а.
      // Если мы сюда долетели — рефреш не сработал, сессии больше нет.
      tokenStorage.clear()
      set({ phase: 'guest', profile: null })
    }
  },
}))
