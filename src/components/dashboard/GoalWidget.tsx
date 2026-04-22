import { useMemo, useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { calculateIncomeStatement, filterByMonth } from '@/utils/financial'
import { formatKRW } from '@/utils/format'

function getCurrentYearMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function GoalWidget() {
  const transactions = useTransactionStore((s) => s.transactions)
  const monthlyProfitGoalKRW = useSettingsStore((s) => s.monthlyProfitGoalKRW)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const netProfitKRW = useMemo(() => {
    const currentMonth = getCurrentYearMonth()
    const currentTxs = filterByMonth(transactions, currentMonth)
    return calculateIncomeStatement(currentTxs, currentMonth).netProfitKRW
  }, [transactions])

  const achievementPct = useMemo(() => {
    if (monthlyProfitGoalKRW <= 0) return 0
    return Math.min((netProfitKRW / monthlyProfitGoalKRW) * 100, 100)
  }, [netProfitKRW, monthlyProfitGoalKRW])

  const remaining = monthlyProfitGoalKRW - netProfitKRW
  const achieved = netProfitKRW >= monthlyProfitGoalKRW && monthlyProfitGoalKRW > 0

  function handleSave() {
    const parsed = Number(inputValue.replace(/,/g, ''))
    if (!isNaN(parsed) && parsed >= 0) {
      updateSettings({ monthlyProfitGoalKRW: parsed })
    }
    setEditing(false)
    setInputValue('')
  }

  function handleStartEdit() {
    setInputValue(monthlyProfitGoalKRW > 0 ? String(monthlyProfitGoalKRW) : '')
    setEditing(true)
  }

  function handleCancel() {
    setEditing(false)
    setInputValue('')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">이번 달 목표 순이익</h2>
        {monthlyProfitGoalKRW > 0 && !editing && (
          <button
            onClick={handleStartEdit}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            목표 수정
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 shrink-0">목표 순이익 (원)</span>
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="예: 3000000"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      ) : monthlyProfitGoalKRW <= 0 ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-gray-400">이번 달 목표를 설정해보세요</p>
          <button
            onClick={handleStartEdit}
            className="w-full border-2 border-dashed border-blue-300 text-blue-500 text-sm font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            + 목표 순이익 설정하기
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">현재 순이익</p>
              <p className={`text-xl font-bold ${netProfitKRW >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                {formatKRW(netProfitKRW)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">목표</p>
              <p className="text-sm font-semibold text-gray-700">{formatKRW(monthlyProfitGoalKRW)}</p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${achieved ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${achievementPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${achieved ? 'text-green-600' : 'text-gray-700'}`}>
              달성률 {achievementPct.toFixed(1)}%
            </span>
            {achieved ? (
              <span className="text-sm text-green-600 font-medium">목표 달성!</span>
            ) : (
              <span className="text-xs text-gray-400">
                목표까지 {formatKRW(remaining)} 남았습니다
              </span>
            )}
          </div>

          {achieved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-sm text-green-700 font-medium">이번 달 목표를 달성했어요!</p>
              <p className="text-xs text-green-500 mt-0.5">수고하셨습니다</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
