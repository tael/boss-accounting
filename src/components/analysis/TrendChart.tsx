import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateCashFlow, getLastNMonths } from '@/utils/financial'
import { formatKRW } from '@/utils/format'

function shortMonth(ym: string): string {
  const [, m] = ym.split('-')
  return `${parseInt(m!, 10)}월`
}

export default function TrendChart() {
  const transactions = useTransactionStore((s) => s.transactions)

  const chartData = useMemo(() => {
    const last12 = getLastNMonths(12)
    const cashFlowMap = new Map(
      calculateCashFlow(transactions).map((entry) => [entry.month, entry]),
    )

    return last12.map((ym) => {
      const entry = cashFlowMap.get(ym)
      return {
        month: shortMonth(ym),
        매출: entry?.inflowKRW ?? 0,
        비용: entry?.outflowKRW ?? 0,
        이익: entry?.netCashFlowKRW ?? 0,
      }
    })
  }, [transactions])

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(0)}억`
    if (Math.abs(value) >= 10_000) return `${(value / 10_000).toFixed(0)}만`
    return `${value}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        월별 매출/비용/이익 추이 (최근 12개월)
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} width={50} />
          <Tooltip formatter={(value: number) => formatKRW(value)} />
          <Legend />
          <Line type="monotone" dataKey="매출" stroke="#3b82f6" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="비용" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="이익" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
