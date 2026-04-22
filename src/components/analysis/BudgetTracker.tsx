import { useMemo, useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { EXPENSE_CATEGORIES } from '@/constants/categories'
import { formatKRW, parseKRW, formatKRWNoSymbol } from '@/utils/format'

function getCurrentYearMonth(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

type BudgetStatus = 'ok' | 'warning' | 'danger' | 'unset'

function getBudgetStatus(spent: number, budget: number | undefined): BudgetStatus {
  if (budget === undefined || budget === 0) return 'unset'
  const ratio = spent / budget
  if (ratio >= 1) return 'danger'
  if (ratio >= 0.8) return 'warning'
  return 'ok'
}

export default function BudgetTracker() {
  const transactions = useTransactionStore((s) => s.transactions)
  const categoryBudgets = useSettingsStore((s) => s.categoryBudgets)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const currentYM = getCurrentYearMonth()

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue
      const txYM = tx.date.slice(0, 7)
      if (txYM !== currentYM) continue
      map[tx.categoryId] = (map[tx.categoryId] ?? 0) + tx.amountKRW
    }
    return map
  }, [transactions, currentYM])

  function startEdit(categoryId: string) {
    const budget = categoryBudgets[categoryId]
    setEditValue(budget ? String(budget) : '')
    setEditingId(categoryId)
  }

  function commitEdit(categoryId: string) {
    const parsed = parseKRW(editValue)
    const updated = { ...categoryBudgets }
    if (!isNaN(parsed) && parsed > 0) {
      updated[categoryId] = parsed
    } else {
      delete updated[categoryId]
    }
    updateSettings({ categoryBudgets: updated })
    setEditingId(null)
  }

  function handleKeyDown(e: React.KeyboardEvent, categoryId: string) {
    if (e.key === 'Enter') commitEdit(categoryId)
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">카테고리별 예산 관리</h2>
      <div className="space-y-3">
        {EXPENSE_CATEGORIES.map((cat) => {
          const spent = spentByCategory[cat.id] ?? 0
          const budget = categoryBudgets[cat.id]
          const status = getBudgetStatus(spent, budget)
          const isUnset = status === 'unset'
          const ratio = budget && budget > 0 ? Math.min(spent / budget, 1) : 0
          const isEditing = editingId === cat.id

          return (
            <div
              key={cat.id}
              className={isUnset ? 'opacity-50' : ''}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{formatKRW(spent)}</span>
                  <span className="text-gray-300">/</span>
                  {isEditing ? (
                    <input
                      autoFocus
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(cat.id)}
                      onKeyDown={(e) => handleKeyDown(e, cat.id)}
                      placeholder="예산 입력"
                      className="w-28 border border-blue-300 rounded px-1.5 py-0.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(cat.id)}
                      className="text-gray-400 hover:text-blue-500 underline decoration-dotted cursor-pointer"
                    >
                      {budget ? formatKRWNoSymbol(budget) + '원' : '예산 미설정'}
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                {!isUnset && (
                  <div
                    className={[
                      'h-2 rounded-full transition-all duration-300',
                      status === 'danger'
                        ? 'bg-red-500'
                        : status === 'warning'
                          ? 'bg-orange-400'
                          : 'bg-green-500',
                    ].join(' ')}
                    style={{ width: `${ratio * 100}%` }}
                  />
                )}
              </div>

              {status === 'danger' && (
                <p className="text-xs text-red-500 mt-0.5">
                  예산 초과 ({formatKRW(spent - (budget ?? 0))} 초과)
                </p>
              )}
              {status === 'warning' && (
                <p className="text-xs text-orange-500 mt-0.5">
                  예산의 {Math.round((spent / (budget ?? 1)) * 100)}% 사용 — 한도 근접
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
