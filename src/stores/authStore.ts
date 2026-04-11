/**
 * Google 인증 Zustand Store
 * 토큰은 메모리에만 유지 (XSS 방지 — localStorage/sessionStorage 사용 금지)
 */

import { create } from 'zustand'
import {
  waitForGoogleIdentityServices,
  requestAccessToken,
  revokeToken,
} from '@/utils/googleDrive'

interface AuthState {
  accessToken: string | null
  isLoading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  isLoading: false,
  error: null,

  signIn: async () => {
    set({ isLoading: true, error: null })
    try {
      await waitForGoogleIdentityServices()
      const token = await requestAccessToken('consent')
      set({ accessToken: token, isLoading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      set({ isLoading: false, error: message })
    }
  },

  signOut: async () => {
    const { accessToken } = get()
    set({ isLoading: true, error: null })
    try {
      if (accessToken) {
        await revokeToken(accessToken)
      }
    } catch {
      // 폐기 실패해도 로컬 상태는 초기화
    } finally {
      set({ accessToken: null, isLoading: false })
    }
  },

  setError: (error) => set({ error }),
}))
