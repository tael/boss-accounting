import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateMonthlyExpenseComparison } from '@/utils/financial'
import { formatKRW } from '@/utils/format'

export default function ExpenseComparisonChart() {
  const transactions = useTransactionStore((s) => s.transactions)

  const { chartData, hasData } = useMemo(() => {
    const comparison = calculateMonthlyExpenseComparison(transactions)
    const data = comparison.map((item) => ({
      category: item.category,
      이번달: item.thisMonth,
      지난달: item.lastMonth,
      changeRate: item.changeRate,
    }))
    return { chartData: data, hasData: data.length > 0 }
  }, [transactions])

  const formatXAxis = (value: number) => {
    if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(0)}억`
    if (Math.abs(value) >= 10_000) return `${(value / 10_000).toFixed(0)}만`
    return `${value}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-1">전월 대비 카테고리별 지출</h2>
      <p className="text-xs text-gray-400 mb-4">변화율 +20% 이상 항목은 빨간색으로 표시됩니다</p>
      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-sm text-gray-400 text-center leading-relaxed">
          이번 달 또는 지난달 지출 데이터가 있으면 비교 차트가 표시됩니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={chartData.length * 56 + 40}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tickFormatter={formatXAxis} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12 }}
              width={64}
            />
            <Tooltip formatter={(value: number) => formatKRW(value)} />
            <Legend />
            <Bar dataKey="이번달" radius={[0, 3, 3, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-this-${index}`}
                  fill={entry.changeRate >= 20 ? '#ef4444' : '#3b82f6'}
                />
              ))}
            </Bar>
            <Bar dataKey="지난달" fill="#d1d5db" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
