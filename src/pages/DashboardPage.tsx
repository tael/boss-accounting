import { useEffect, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { useRecurringStore } from '@/stores/recurringStore'
import { useAssetStore } from '@/stores/assetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import MonthSummary from '@/components/dashboard/MonthSummary'
import GoalWidget from '@/components/dashboard/GoalWidget'
import HealthScoreWidget from '@/components/dashboard/HealthScoreWidget'
import OnboardingQuest from '@/components/dashboard/OnboardingQuest'
import InsightCard from '@/components/dashboard/InsightCard'
import { getUpcomingSchedule, getDDaySchedules } from '@/constants/taxSchedule'
import type { TaxType } from '@/constants/taxSchedule'
import { BOOK_REFERENCES } from '@/constants/bookReferences'
import { formatKRW } from '@/utils/format'


const TYPE_LABEL: Record<TaxType, string> = {
  부가세: 'text-blue-600 bg-blue-100',
  종합소득세: 'text-purple-600 bg-purple-100',
  원천세: 'text-orange-600 bg-orange-100',
}

export default function DashboardPage() {
  const transactions = useTransactionStore((s) => s.transactions)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const applyDueTemplates = useRecurringStore((s) => s.applyDueTemplates)
  const applyMonthlyDepreciation = useAssetStore((s) => s.applyMonthlyDepreciation)
  const { onboardingCompleted, questCompleted } = useSettingsStore()

  // 대시보드 마운트 시 반복 거래 템플릿 + 사업용 자산 감가상각 자동 적용
  // (오늘 기준 이번 달 미적용 항목만, 중복 방지 lastAppliedMonth로 보장)
  useEffect(() => {
    applyDueTemplates(addTransaction)
    applyMonthlyDepreciation(addTransaction)
  }, [applyDueTemplates, applyMonthlyDepreciation, addTransaction])

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [transactions])

  const upcomingSchedule = useMemo(() => getUpcomingSchedule(), [])
  const ddaySchedules = useMemo(() => getDDaySchedules(), [])
  const taxRef = BOOK_REFERENCES['dashboard.taxSchedule']

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">대시보드</h1>

      <MonthSummary />

      <GoalWidget />

      {!onboardingCompleted && questCompleted.length < 5 && <OnboardingQuest />}

      <HealthScoreWidget />

      {/* D-Day 세무 일정 위젯 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-3">다가오는 세무 일정</h2>
        <div className="space-y-2">
          {ddaySchedules.map((item) => {
            const ddayLabel = item.dday === 0 ? 'D-Day' : `D-${item.dday}`
            const colorClass =
              item.dday <= 7
                ? 'bg-red-50 border-red-200 text-red-700'
                : item.dday <= 14
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
            const badgeClass =
              item.dday <= 7
                ? 'bg-red-100 text-red-700'
                : item.dday <= 14
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-blue-100 text-blue-700'
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 ${colorClass}`}
              >
                <span className="text-sm font-medium truncate">{item.title}</span>
                <span className={`ml-3 whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                  {ddayLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <InsightCard />

      {/* 다가오는 세금 일정 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">다가오는 세금 일정</h2>
          <span className="text-xs text-gray-400">챕터 {taxRef.chapter}</span>
        </div>
        {upcomingSchedule.length === 0 ? (
          <p className="text-sm text-gray-400">이번 달 예정된 신고 일정이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {upcomingSchedule.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_LABEL[item.taxType] ?? 'text-gray-600 bg-gray-100'}`}
                    >
                      {item.taxType}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 pl-1">{item.description}</p>
                </div>
                <span className="text-xs text-red-500 font-medium whitespace-nowrap">
                  ~{item.periodEnd}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 거래 5건 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-3">최근 거래</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-400">거래 내역이 없습니다.</p>
        ) : (
          <div className="space-y-0">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {tx.memo || tx.categoryId}
                  </p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
                <span
                  className={`text-sm font-semibold ml-3 ${
                    tx.type === 'income' ? 'text-blue-600' : 'text-red-500'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatKRW(tx.amountKRW)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
