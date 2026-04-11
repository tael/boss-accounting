import type { BookReferenceKey } from '@/constants/bookReferences'
import { formatKRW, formatMargin, formatChangeRate } from '@/utils/format'

interface StatCardProps {
  title: string
  value: number
  previousValue?: number
  format: 'krw' | 'percent' | 'count'
  refKey?: BookReferenceKey
}

function formatValue(value: number, format: 'krw' | 'percent' | 'count'): string {
  if (format === 'krw') return formatKRW(value)
  if (format === 'percent') return formatMargin(value)
  return value.toLocaleString('ko-KR')
}

export default function StatCard({ title, value, previousValue, format }: StatCardProps) {
  const hasComparison = previousValue !== undefined && previousValue !== null
  const changeRate =
    hasComparison && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : null

  const isPositive = changeRate !== null && changeRate >= 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{formatValue(value, format)}</p>
      {changeRate !== null && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}
          >
            {isPositive ? '▲' : '▼'} {formatChangeRate(Math.abs(changeRate))}
          </span>
          <span className="text-xs text-gray-400">전월 대비</span>
        </div>
      )}
      {!hasComparison && <div className="mt-2 h-5" />}
    </div>
  )
}
