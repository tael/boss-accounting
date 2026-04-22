/**
 * 반복 거래 템플릿 Zustand Store
 * persist middleware로 localStorage 저장
 * applyDueTemplates: 오늘 날짜 기준으로 이번 달 아직 적용 안 된 템플릿을 거래로 생성
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  RecurringTemplate,
  RecurringTemplateInput,
} from '@/types/recurringTemplate'
import type { Transaction, TransactionInput } from '@/types/transaction'
import { localStorageAdapter } from '@/utils/storage'

/** Store 스키마 버전 */
const STORE_VERSION = 1

/** 저장 키 */
const STORAGE_KEY = 'boss-accounting-recurring-templates'

interface RecurringState {
  templates: RecurringTemplate[]
  // Actions
  addTemplate: (input: RecurringTemplateInput) => RecurringTemplate
  updateTemplate: (id: string, update: Partial<RecurringTemplateInput>) => boolean
  deleteTemplate: (id: string) => boolean
  /**
   * 오늘 날짜 기준으로 이번 달에 아직 적용되지 않은 활성 템플릿을 거래로 생성한다.
   * @param addTransaction - 거래 추가 함수 (transactionStore.addTransaction 주입)
   * @returns 자동 등록된 거래 건수
   */
  applyDueTemplates: (
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

/** 오늘 기준 YYYY-MM-DD 반환 (dayOfMonth로 이번 달 날짜 생성) */
function buildDateForMonth(yearMonth: string, dayOfMonth: number): string {
  const day = String(dayOfMonth).padStart(2, '0')
  return `${yearMonth}-${day}`
}

export const useRecurringStore = create<RecurringState>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (input: RecurringTemplateInput): RecurringTemplate => {
        const template: RecurringTemplate = {
          id: generateId(),
          ...input,
        }
        set((state) => ({ templates: [...state.templates, template] }))
        return template
      },

      updateTemplate: (
        id: string,
        update: Partial<RecurringTemplateInput>,
      ): boolean => {
        const { templates } = get()
        const index = templates.findIndex((t) => t.id === id)
        if (index === -1) return false

        const updated: RecurringTemplate = {
          ...templates[index]!,
          ...update,
        }
        const next = [...templates]
        next[index] = updated
        set({ templates: next })
        return true
      },

      deleteTemplate: (id: string): boolean => {
        const { templates } = get()
        const exists = templates.some((t) => t.id === id)
        if (!exists) return false

        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))
        return true
      },

      applyDueTemplates: (
        addTransaction: (input: TransactionInput) => Transaction,
      ): number => {
        const { templates } = get()
        const today = new Date()
        const todayDay = today.getDate()
        const currentMonth = getCurrentYearMonth()

        let appliedCount = 0
        const updatedTemplates = templates.map((tpl) => {
          // 비활성 템플릿은 건너뜀
          if (!tpl.enabled) return tpl
          // 이번 달 이미 적용된 템플릿은 건너뜀
          if (tpl.lastAppliedMonth === currentMonth) return tpl
          // 아직 등록 날짜가 되지 않았으면 건너뜀
          if (todayDay < tpl.dayOfMonth) return tpl

          const txInput: TransactionInput = {
            type: tpl.type,
            date: buildDateForMonth(currentMonth, tpl.dayOfMonth),
            amountKRW: tpl.amountKRW,
            categoryId: tpl.categoryId,
            memo: tpl.memo,
            isVatDeductible:
              tpl.type === 'expense' ? tpl.isVatDeductible !== false : undefined,
          }
          addTransaction(txInput)
          appliedCount += 1

          return { ...tpl, lastAppliedMonth: currentMonth }
        })

        if (appliedCount > 0) {
          set({ templates: updatedTemplates })
        }
        return appliedCount
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorageAdapter),
      version: STORE_VERSION,
      migrate: (persistedState, _version) => {
        return persistedState as RecurringState
      },
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[RecurringStore] 데이터 복원 실패:', error)
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
