import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTransactionStore } from '@/stores/transactionStore'
import { filterByMonth, sumByCategory } from '@/utils/financial'
import { formatKRW } from '@/utils/format'

const COLORS = [
  '#3b82f6',
  '#ef4444',
  '#f59e0b',
  '#22c55e',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
]

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function ExpensePieChart() {
  const transactions = useTransactionStore((s) => s.transactions)

  const data = useMemo(() => {
    const ym = getCurrentYearMonth()
    const monthTxs = filterByMonth(transactions, ym).filter((tx) => tx.type === 'expense')
    const summary = sumByCategory(monthTxs)
    return summary
      .filter((s) => s.totalKRW > 0)
      .map((s) => ({ name: s.categoryName, value: s.totalKRW }))
  }, [transactions])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          카테고리별 비용 비중 (이번 달)
        </h2>
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          이번 달 비용 내역이 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        카테고리별 비용 비중 (이번 달)
      </h2>
      <p className="text-xs text-gray-400 mb-4">총 비용: {formatKRW(total)}</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatKRW(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
