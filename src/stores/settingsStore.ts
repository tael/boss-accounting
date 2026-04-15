/**
 * 사용자 설정 Zustand Store
 * persist middleware로 localStorage에 저장
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { localStorageAdapter } from '@/utils/storage'

/** 테마 유형 */
export type Theme = 'light' | 'dark' | 'system'

/** 사용자 설정 */
export interface Settings {
  /** UI 테마 */
  theme: Theme
  /** 사업연도 시작월 (1-12, 기본: 1월) */
  fiscalYearStartMonth: number
  /** 사업자 이름 (선택) */
  businessName?: string
  /** 사업자 유형: 일반과세자 | 간이과세자 */
  taxType: 'general' | 'simplified'
  /** 대시보드 기본 표시 기간: 'month' | 'quarter' | 'year' */
  defaultPeriod: 'month' | 'quarter' | 'year'
  /** 직원 유무 (원천세 신고 필요 여부) */
  hasEmployees: boolean
  /** 온보딩 완료 여부 */
  onboardingCompleted: boolean
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  fiscalYearStartMonth: 1,
  taxType: 'general',
  defaultPeriod: 'month',
  hasEmployees: false,
  onboardingCompleted: false,
}

interface SettingsState extends Settings {
  updateSettings: (partial: Partial<Settings>) => void
  resetSettings: () => void
  setTaxType: (taxType: Settings['taxType']) => void
  setHasEmployees: (hasEmployees: boolean) => void
  setOnboardingCompleted: (onboardingCompleted: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (partial: Partial<Settings>): void => {
        set((state) => ({ ...state, ...partial }))
      },

      resetSettings: (): void => {
        set({ ...DEFAULT_SETTINGS })
      },

      setTaxType: (taxType: Settings['taxType']): void => {
        set({ taxType })
      },

      setHasEmployees: (hasEmployees: boolean): void => {
        set({ hasEmployees })
      },

      setOnboardingCompleted: (onboardingCompleted: boolean): void => {
        set({ onboardingCompleted })
      },
    }),
    {
      name: 'boss-accounting-settings',
      storage: createJSONStorage(() => localStorageAdapter),
      version: 1,
      migrate: (persistedState, version) => {
        switch (version) {
          case 0:
            // v0 → v1 마이그레이션 (향후)
            return persistedState
          default:
            return persistedState
        }
      },
    },
  ),
)
