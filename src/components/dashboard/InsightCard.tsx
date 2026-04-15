import { useMemo, useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { generateInsights } from '@/utils/financial'
import type { FinancialInsight } from '@/utils/financial'
import BookReference from '@/components/transactions/BookReference'

const MAX_VISIBLE = 3

function InsightItem({ insight }: { insight: FinancialInsight }) {
  const bgClass =
    insight.type === 'warning'
      ? 'bg-yellow-50 border-yellow-200'
      : insight.type === 'success'
        ? 'bg-green-50 border-green-200'
        : 'bg-blue-50 border-blue-200'

  const icon =
    insight.type === 'warning' ? '⚠️' : insight.type === 'success' ? '✅' : 'ℹ️'

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${bgClass}`}>
      <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
      <p className="flex-1 text-sm text-gray-800 leading-relaxed">{insight.message}</p>
      {insight.bookRefKey && (
        <span className="shrink-0 mt-0.5">
          <BookReference refKey={insight.bookRefKey} />
        </span>
      )}
    </div>
  )
}

export default function InsightCard() {
  const transactions = useTransactionStore((s) => s.transactions)
  const [expanded, setExpanded] = useState(false)

  const insights = useMemo(
    () => generateInsights(transactions).sort((a, b) => b.priority - a.priority),
    [transactions],
  )
  const visible = expanded ? insights : insights.slice(0, MAX_VISIBLE)
  const hasMore = insights.length > MAX_VISIBLE

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-3">인사이트</h2>
      <div className="space-y-2">
        {visible.map((insight, idx) => (
          <InsightItem key={idx} insight={insight} />
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {expanded ? '접기' : `더보기 (${insights.length - MAX_VISIBLE}개)`}
        </button>
      )}
    </div>
  )
}
