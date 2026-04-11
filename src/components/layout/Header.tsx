import { useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { formatKRW } from '@/utils/format'

export function Header() {
  const transactions = useTransactionStore((s) => s.transactions)

  const summary = useMemo(() => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    let income = 0
    let expense = 0

    for (const tx of transactions) {
      if (!tx.date.startsWith(ym)) continue
      if (tx.type === 'income') income += tx.amountKRW
      else expense += tx.amountKRW
    }

    return { income, expense, profit: income - expense }
  }, [transactions])

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      {/* 로고 */}
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-primary-700">사장님 회계 도우미</span>
      </div>

      {/* 이번 달 요약 미니 */}
      <div className="hidden sm:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">매출</span>
          <span className="font-semibold text-income">{formatKRW(summary.income)}</span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1">
          <span className="text-gray-500">비용</span>
          <span className="font-semibold text-expense">{formatKRW(summary.expense)}</span>
        </div>
        <div className="w-px h-3 bg-gray-200" />
        <div className="flex items-center gap-1">
          <span className="text-gray-500">순이익</span>
          <span
            className={[
              'font-semibold',
              summary.profit >= 0 ? 'text-income' : 'text-expense',
            ].join(' ')}
          >
            {formatKRW(summary.profit)}
          </span>
        </div>
        <span className="text-gray-400 ml-1">이번 달</span>
      </div>
    </header>
  )
}
