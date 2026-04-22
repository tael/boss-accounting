/**
 * 연속 기록 스트릭 + 사장님 레벨 뱃지 위젯
 */

import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { getBusinessLevel } from '@/utils/financial'
import { getTodayLocal } from '@/utils/format'

export default function StreakBadge() {
  const transactions = useTransactionStore((s) => s.transactions)
  const { currentStreak, maxStreak, lastEntryDate } = useSettingsStore()

  const today = getTodayLocal()
  const hasTodayEntry = transactions.some((tx) => tx.date === today)

  const totalTransactions = transactions.length
  const totalProfit = transactions.reduce((acc, tx) => {
    return acc + (tx.type === 'income' ? tx.amountKRW : -tx.amountKRW)
  }, 0)
  const { level, title, nextTitle, progress } = getBusinessLevel(totalTransactions, totalProfit)

  const isGold = currentStreak >= 7

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${
        isGold
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* 스트릭 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔥</span>
            <span
              className={`text-3xl font-bold ${
                isGold ? 'text-amber-500' : 'text-gray-800'
              }`}
            >
              {currentStreak}
            </span>
            <span className="text-sm text-gray-500 self-end mb-1">일 연속</span>
          </div>
          <p className="text-xs text-gray-400">
            최장 기록: {maxStreak}일
          </p>
          {lastEntryDate && (
            <p className="text-xs text-gray-400 mt-0.5">
              마지막 입력: {lastEntryDate}
            </p>
          )}
          {!hasTodayEntry && (
            <p className="text-xs text-orange-500 mt-2 font-medium">
              오늘 장부 마감하셨나요? 📒
            </p>
          )}
        </div>

        {/* 레벨 */}
        <div className="text-right min-w-0">
          <div className="text-xs text-gray-400 mb-0.5">Lv.{level}</div>
          <div
            className={`text-sm font-semibold ${
              isGold ? 'text-amber-600' : 'text-gray-700'
            }`}
          >
            {title}
          </div>
          {level < 6 && (
            <>
              <div className="mt-2 w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isGold ? 'bg-amber-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                다음: {nextTitle}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
