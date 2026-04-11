import { useState, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import {
  calculateIncomeStatement,
  filterByMonth,
  filterByDateRange,
} from '@/utils/financial'
import { formatKRW, formatMargin } from '@/utils/format'
import type { IncomeStatement as IIncomeStatement } from '@/types/financial'

type PeriodType = 'month' | 'quarter' | 'year'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getQuarterRange(year: number, quarter: number): { from: string; to: string } {
  const startMonth = (quarter - 1) * 3 + 1
  const endMonth = startMonth + 2
  const from = `${year}-${String(startMonth).padStart(2, '0')}-01`
  const endDate = new Date(year, endMonth, 0)
  const to = `${year}-${String(endMonth).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  return { from, to }
}

function getCurrentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3)
}

export default function IncomeStatement() {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const transactions = useTransactionStore((s) => s.transactions)

  const statement = useMemo((): IIncomeStatement => {
    const now = new Date()
    const year = now.getFullYear()

    if (periodType === 'month') {
      const ym = getCurrentYearMonth()
      const txs = filterByMonth(transactions, ym)
      return calculateIncomeStatement(txs, ym)
    }

    if (periodType === 'quarter') {
      const q = getCurrentQuarter()
      const { from, to } = getQuarterRange(year, q)
      const txs = filterByDateRange(transactions, from, to)
      return calculateIncomeStatement(txs, `${year}-Q${q}`)
    }

    // year
    const from = `${year}-01-01`
    const to = `${year}-12-31`
    const txs = filterByDateRange(transactions, from, to)
    return calculateIncomeStatement(txs, `${year}`)
  }, [periodType, transactions])

  const tabs: { label: string; value: PeriodType }[] = [
    { label: '월별', value: 'month' },
    { label: '분기별', value: 'quarter' },
    { label: '연간', value: 'year' },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">손익계산서</h2>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPeriodType(tab.value)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                periodType === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">기간: {statement.period}</p>

      {/* 매출 섹션 */}
      <div className="mb-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">매출</span>
          <span className="text-sm font-bold text-blue-600">
            {formatKRW(statement.totalIncomeKRW)}
          </span>
        </div>
        {statement.incomeByCategory.map((cat) => (
          <div
            key={cat.categoryId}
            className="flex justify-between items-center py-1.5 pl-4"
          >
            <span className="text-sm text-gray-500">{cat.categoryName}</span>
            <span className="text-sm text-gray-700">{formatKRW(cat.totalKRW)}</span>
          </div>
        ))}
        {statement.incomeByCategory.length === 0 && (
          <p className="pl-4 py-1.5 text-sm text-gray-400">내역 없음</p>
        )}
      </div>

      {/* 비용 섹션 */}
      <div className="mb-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">비용</span>
          <span className="text-sm font-bold text-red-500">
            {formatKRW(statement.totalExpenseKRW)}
          </span>
        </div>
        {statement.expenseByCategory.map((cat) => (
          <div
            key={cat.categoryId}
            className="flex justify-between items-center py-1.5 pl-4"
          >
            <span className="text-sm text-gray-500">{cat.categoryName}</span>
            <span className="text-sm text-gray-700">{formatKRW(cat.totalKRW)}</span>
          </div>
        ))}
        {statement.expenseByCategory.length === 0 && (
          <p className="pl-4 py-1.5 text-sm text-gray-400">내역 없음</p>
        )}
      </div>

      {/* 순이익 */}
      <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
        <span className="text-sm font-bold text-gray-800">순이익</span>
        <span
          className={`text-lg font-bold ${
            statement.netProfitKRW >= 0 ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {formatKRW(statement.netProfitKRW)}
        </span>
      </div>
      <div className="flex justify-between items-center py-1">
        <span className="text-xs text-gray-400">이익률</span>
        <span className="text-sm font-medium text-gray-600">
          {formatMargin(statement.profitMarginPct)}
        </span>
      </div>
    </div>
  )
}
