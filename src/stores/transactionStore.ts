/**
 * 거래 Zustand Store
 * persist middleware + migrate 옵션으로 스키마 버전 관리
 * 저장 실패 시 storage-error 커스텀 이벤트 발생
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Transaction, TransactionInput, TransactionFilter } from '@/types/transaction'
import { localStorageAdapter } from '@/utils/storage'
import { validateTransactions } from '@/utils/exportImport'

/** Store 스키마 버전 */
const STORE_VERSION = 1

/** 저장 키 */
const STORAGE_KEY = 'boss-accounting-transactions'

interface TransactionState {
  transactions: Transaction[]
  // Actions
  addTransaction: (input: TransactionInput) => Transaction
  updateTransaction: (id: string, update: Partial<TransactionInput>) => boolean
  deleteTransaction: (id: string) => boolean
  getFiltered: (filter: TransactionFilter) => Transaction[]
  clearAll: () => void
  importTransactions: (transactions: Transaction[]) => void
  bulkAddTransactions: (inputs: TransactionInput[]) => void
}

/** UUID 생성 (crypto.randomUUID 사용, non-secure context fallback 포함) */
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // fallback for non-secure contexts
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  }) + '-' + Date.now().toString(36)
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (input: TransactionInput): Transaction => {
        const now = new Date().toISOString()
        const transaction: Transaction = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ transactions: [...state.transactions, transaction] }))
        return transaction
      },

      updateTransaction: (id: string, update: Partial<TransactionInput>): boolean => {
        const { transactions } = get()
        const index = transactions.findIndex((tx) => tx.id === id)
        if (index === -1) return false

        const updated: Transaction = {
          ...transactions[index]!,
          ...update,
          updatedAt: new Date().toISOString(),
        }
        const next = [...transactions]
        next[index] = updated
        set({ transactions: next })
        return true
      },

      deleteTransaction: (id: string): boolean => {
        const { transactions } = get()
        const exists = transactions.some((tx) => tx.id === id)
        if (!exists) return false

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }))
        return true
      },

      getFiltered: (filter: TransactionFilter): Transaction[] => {
        return get().transactions.filter((tx) => {
          if (filter.type && tx.type !== filter.type) return false
          if (filter.categoryId && tx.categoryId !== filter.categoryId) return false
          if (filter.dateFrom && tx.date < filter.dateFrom) return false
          if (filter.dateTo && tx.date > filter.dateTo) return false
          if (filter.amountMin !== undefined && tx.amountKRW < filter.amountMin) return false
          if (filter.amountMax !== undefined && tx.amountKRW > filter.amountMax) return false
          if (filter.memoSearch) {
            const keyword = filter.memoSearch.toLowerCase()
            if (!tx.memo?.toLowerCase().includes(keyword)) return false
          }
          return true
        })
      },

      clearAll: (): void => {
        set({ transactions: [] })
      },

      importTransactions: (incoming: Transaction[]): void => {
        set({ transactions: incoming })
      },

      bulkAddTransactions: (inputs: TransactionInput[]): void => {
        const now = new Date().toISOString()
        const newTxs: Transaction[] = inputs.map((input) => ({
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        }))
        set((state) => ({ transactions: [...state.transactions, ...newTxs] }))
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorageAdapter),
      version: STORE_VERSION,
      migrate: (persistedState, version) => {
        const state = persistedState as { transactions?: unknown[] }
        // 손상된 거래 항목 필터링
        if (Array.isArray(state?.transactions)) {
          state.transactions = validateTransactions(state.transactions)
        }
        switch (version) {
          case 0:
            // v0 → v1: 향후 필드 추가 시 여기에 마이그레이션 작성
            return state
          default:
            return state
        }
      },
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[TransactionStore] 데이터 복원 실패:', error)
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
