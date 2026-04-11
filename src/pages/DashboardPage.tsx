import { useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import MonthSummary from '@/components/dashboard/MonthSummary'
import { TAX_SCHEDULE } from '@/constants/taxSchedule'
import { BOOK_REFERENCES } from '@/constants/bookReferences'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getUpcoming(): typeof TAX_SCHEDULE {
  const now = new Date()
  const currentMM = String(now.getMonth() + 1).padStart(2, '0')
  const nextMM = String(((now.getMonth() + 1) % 12) + 1).padStart(2, '0')
  const seen = new Set<string>()
  const results = TAX_SCHEDULE.filter(
    (item) =>
      item.periodEnd.startsWith(currentMM) || item.periodEnd.startsWith(nextMM),
  ).filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
  return results
}

function formatAmount(n: number): string {
  return `₩${Math.round(n).toLocaleString('ko-KR')}`
}

const TYPE_LABEL: Record<string, string> = {
  부가세: 'text-blue-600 bg-blue-100',
  종합소득세: 'text-purple-600 bg-purple-100',
  원천세: 'text-orange-600 bg-orange-100',
}

export default function DashboardPage() {
  const transactions = useTransactionStore((s) => s.transactions)

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
  }, [transactions])

  const upcomingSchedule = useMemo(() => getUpcoming(), [])
  const taxRef = BOOK_REFERENCES['dashboard.taxSchedule']

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">대시보드</h1>

      <MonthSummary />

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
                  {formatAmount(tx.amountKRW)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
