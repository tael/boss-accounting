/**
 * 사업용 고정자산 Zustand Store
 * persist middleware로 localStorage 저장
 * applyMonthlyDepreciation: 이번 달 아직 상각되지 않은 활성 자산의 감가상각비를 거래로 생성
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FixedAsset, FixedAssetInput } from '@/types/fixedAsset'
import type { Transaction, TransactionInput } from '@/types/transaction'
import { localStorageAdapter } from '@/utils/storage'

/** Store 스키마 버전 */
const STORE_VERSION = 1

/** 저장 키 */
const STORAGE_KEY = 'boss-accounting-assets'

interface AssetState {
  assets: FixedAsset[]
  // Actions
  addAsset: (input: FixedAssetInput) => FixedAsset
  updateAsset: (id: string, update: Partial<FixedAssetInput>) => boolean
  deleteAsset: (id: string) => boolean
  /**
   * 이번 달 아직 상각되지 않은 활성 자산의 감가상각비를 거래로 생성한다.
   * @param addTransaction - 거래 추가 함수 (transactionStore.addTransaction 주입)
   * @returns 자동 등록된 거래 건수
   */
  applyMonthlyDepreciation: (
    addTransaction: (input: TransactionInput) => Transaction,
  ) => number
}

/** UUID 생성 (crypto.randomUUID 사용, non-secure context fallback 포함) */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  }) + '-' + Date.now().toString(36)
}

/** 오늘 기준 YYYY-MM 반환 */
function getCurrentYearMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** YYYY-MM 월말일을 YYYY-MM-DD 형식으로 반환 (감가상각비 거래 일자) */
function buildMonthEndDate(yearMonth: string): string {
  const [yStr, mStr] = yearMonth.split('-')
  const y = Number(yStr)
  const m = Number(mStr)
  // 다음 달 0일 = 이번 달 마지막 날
  const lastDay = new Date(y, m, 0).getDate()
  return `${yearMonth}-${String(lastDay).padStart(2, '0')}`
}

/**
 * 월 감가상각액 계산 (정액법)
 * (취득가 - 잔존가치) / (내용연수 * 12)
 * 정수 원 단위로 반올림
 */
function calcMonthlyDepreciation(
  purchaseCostKRW: number,
  residualValueKRW: number,
  usefulLifeYears: number,
): number {
  if (!Number.isFinite(usefulLifeYears) || usefulLifeYears <= 0) return 0
  const base = purchaseCostKRW - residualValueKRW
  if (!Number.isFinite(base) || base <= 0) return 0
  return Math.round(base / (usefulLifeYears * 12))
}

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: [],

      addAsset: (input: FixedAssetInput): FixedAsset => {
        const monthlyDepreciationKRW = calcMonthlyDepreciation(
          input.purchaseCostKRW,
          input.residualValueKRW,
          input.usefulLifeYears,
        )
        const asset: FixedAsset = {
          id: generateId(),
          ...input,
          monthlyDepreciationKRW,
        }
        set((state) => ({ assets: [...state.assets, asset] }))
        return asset
      },

      updateAsset: (
        id: string,
        update: Partial<FixedAssetInput>,
      ): boolean => {
        const { assets } = get()
        const index = assets.findIndex((a) => a.id === id)
        if (index === -1) return false

        const prev = assets[index]!
        const merged = { ...prev, ...update }
        // 금액/내용연수/잔존가치가 바뀌면 월 감가상각액 재계산
        const shouldRecalc =
          update.purchaseCostKRW !== undefined ||
          update.residualValueKRW !== undefined ||
          update.usefulLifeYears !== undefined
        const monthlyDepreciationKRW = shouldRecalc
          ? calcMonthlyDepreciation(
              merged.purchaseCostKRW,
              merged.residualValueKRW,
              merged.usefulLifeYears,
            )
          : prev.monthlyDepreciationKRW

        const updated: FixedAsset = {
          ...merged,
          monthlyDepreciationKRW,
        }
        const next = [...assets]
        next[index] = updated
        set({ assets: next })
        return true
      },

      deleteAsset: (id: string): boolean => {
        const { assets } = get()
        const exists = assets.some((a) => a.id === id)
        if (!exists) return false

        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id),
        }))
        return true
      },

      applyMonthlyDepreciation: (
        addTransaction: (input: TransactionInput) => Transaction,
      ): number => {
        const { assets } = get()
        const currentMonth = getCurrentYearMonth()
        const txDate = buildMonthEndDate(currentMonth)

        let appliedCount = 0
        const updatedAssets = assets.map((asset) => {
          // 비활성 자산은 건너뜀
          if (!asset.enabled) return asset
          // 이번 달 이미 적용된 자산은 건너뜀
          if (asset.lastAppliedMonth === currentMonth) return asset
          // 취득월 이전에는 상각하지 않음
          if (asset.purchaseDate.slice(0, 7) > currentMonth) return asset
          // 월 상각액이 0이면 건너뜀
          if (asset.monthlyDepreciationKRW <= 0) return asset

          const txInput: TransactionInput = {
            type: 'expense',
            date: txDate,
            amountKRW: asset.monthlyDepreciationKRW,
            categoryId: asset.depreciationCategoryId,
            memo: `감가상각비 - ${asset.name}`,
            // 감가상각비는 적격증빙 대상이 아님 (매입세액 공제 없음)
            isVatDeductible: false,
          }
          addTransaction(txInput)
          appliedCount += 1

          return { ...asset, lastAppliedMonth: currentMonth }
        })

        if (appliedCount > 0) {
          set({ assets: updatedAssets })
        }
        return appliedCount
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorageAdapter),
      version: STORE_VERSION,
      migrate: (persistedState, _version) => {
        return persistedState as AssetState
      },
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[AssetStore] 데이터 복원 실패:', error)
            window.dispatchEvent(
              new CustomEvent('storage-error', {
                detail: {
                  key: STORAGE_KEY,
                  error: error instanceof Error ? error.message : String(error),
                  type: 'unknown',
                },
              }),
            )
          }
        }
      },
    },
  ),
)
