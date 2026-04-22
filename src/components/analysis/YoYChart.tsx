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
} from 'recharts'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateYoYComparison } from '@/utils/financial'
import { formatKRW } from '@/utils/format'

function shortMonth(ym: string): string {
  const [, m] = ym.split('-')
  return `${parseInt(m!, 10)}월`
}

export default function YoYChart() {
  const transactions = useTransactionStore((s) => s.transactions)

  const { chartData, hasLastYearData } = useMemo(() => {
    const yoy = calculateYoYComparison(transactions)
    const data = yoy.map((entry) => ({
      month: shortMonth(entry.month),
      올해: entry.thisYear,
      전년: entry.lastYear,
    }))
    const anyLastYear = yoy.some((entry) => entry.lastYear > 0)
    return { chartData: data, hasLastYearData: anyLastYear }
  }, [transactions])

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 100_000_000) return `${(value / 100_000_000).toFixed(0)}억`
    if (Math.abs(value) >= 10_000) return `${(value / 10_000).toFixed(0)}만`
    return `${value}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">전년 동기 매출 비교 (YoY)</h2>
      {!hasLastYearData ? (
        <div className="flex items-center justify-center h-40 text-sm text-gray-400 text-center leading-relaxed">
          1년 이상 데이터가 쌓이면 전년 대비 분석이 가능합니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} width={72} />
            <Tooltip formatter={(value: number) => formatKRW(value)} />
            <Legend />
            <Bar dataKey="올해" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            <Bar dataKey="전년" fill="#d1d5db" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
