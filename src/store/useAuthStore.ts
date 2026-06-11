import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { refreshAccessToken } from '@/services/spotifyAuth'

interface AuthStore {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  isInitializing: boolean
  authError: string | null
  setTokens: (accessToken: string, refreshToken: string, expiresAt: number) => void
  clearTokens: () => void
  setInitializing: (v: boolean) => void
  setAuthError: (message: string | null) => void
  /** 유효한 액세스 토큰 반환 — 만료 임박 시 자동 갱신 */
  getValidToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isInitializing: false,
      authError: null,

      setTokens: (accessToken, refreshToken, expiresAt) =>
        set((s) => {
          s.accessToken = accessToken
          s.refreshToken = refreshToken
          s.expiresAt = expiresAt
          s.authError = null
        }),

      clearTokens: () =>
        set((s) => {
          s.accessToken = null
          s.refreshToken = null
          s.expiresAt = null
        }),

      setInitializing: (v) =>
        set((s) => {
          s.isInitializing = v
        }),

      setAuthError: (message) =>
        set((s) => {
          s.authError = message
        }),

      getValidToken: async () => {
        const { accessToken, refreshToken, expiresAt } = get()
        if (!accessToken || !refreshToken) return null

        // 만료 5분 전에 미리 갱신
        const needsRefresh = Date.now() > (expiresAt ?? 0) - 5 * 60 * 1000
        if (!needsRefresh) return accessToken

        try {
          const { accessToken: newToken, expiresAt: newExpiry } =
            await refreshAccessToken(refreshToken)
          set((s) => {
            s.accessToken = newToken
            s.expiresAt = newExpiry
          })
          return newToken
        } catch {
          get().clearTokens()
          return null
        }
      },
    })),
    {
      name: 'spotify-auth',
      partialize: (s) => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        expiresAt: s.expiresAt,
      }),
    }
  )
)
