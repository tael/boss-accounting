import { useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import {
  calculateIncomeStatement,
  filterByMonth,
  calculateChangeRate,
} from '@/utils/financial'
import StatCard from './StatCard'

function getCurrentYearMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getPrevYearMonth(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const prevDate = new Date(y!, m! - 1, 1)
  prevDate.setMonth(prevDate.getMonth() - 1)
  const py = prevDate.getFullYear()
  const pm = String(prevDate.getMonth() + 1).padStart(2, '0')
  return `${py}-${pm}`
}

export default function MonthSummary() {
  const transactions = useTransactionStore((s) => s.transactions)

  const { current, prev } = useMemo(() => {
    const currentMonth = getCurrentYearMonth()
    const prevMonth = getPrevYearMonth(currentMonth)

    const currentTxs = filterByMonth(transactions, currentMonth)
    const prevTxs = filterByMonth(transactions, prevMonth)

    return {
      current: calculateIncomeStatement(currentTxs, currentMonth),
      prev: calculateIncomeStatement(prevTxs, prevMonth),
    }
  }, [transactions])

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-700 mb-3">
        이번 달 요약 ({current.period})
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="매출"
          value={current.totalIncomeKRW}
          previousValue={prev.totalIncomeKRW}
          format="krw"
          refKey="dashboard.revenue"
        />
        <StatCard
          title="비용"
          value={current.totalExpenseKRW}
          previousValue={prev.totalExpenseKRW}
          format="krw"
          refKey="dashboard.expenses"
        />
        <StatCard
          title="순이익"
          value={current.netProfitKRW}
          previousValue={prev.netProfitKRW}
          format="krw"
          refKey="dashboard.netProfit"
        />
        <StatCard
          title="이익률"
          value={current.profitMarginPct}
          previousValue={prev.profitMarginPct}
          format="percent"
          refKey="dashboard.profitMargin"
        />
      </div>
    </div>
  )
}
