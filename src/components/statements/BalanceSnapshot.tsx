import { useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { formatKRW } from '@/utils/format'

export default function BalanceSnapshot() {
  const transactions = useTransactionStore((s) => s.transactions)

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0
    let exp = 0
    for (const tx of transactions) {
      if (tx.type === 'income') inc += tx.amountKRW
      else exp += tx.amountKRW
    }
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp }
  }, [transactions])

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">재무 현황 (누적)</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">누적 매출</span>
          <span className="text-sm font-medium text-blue-600">{formatKRW(totalIncome)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-sm text-gray-600">누적 비용</span>
          <span className="text-sm font-medium text-red-500">{formatKRW(totalExpense)}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-t-2 border-gray-300">
          <span className="text-sm font-bold text-gray-800">현금 잔액 (추정)</span>
          <span
            className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {formatKRW(balance)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">
        * MVP 기준: 현금 잔액 = 누적 매출 - 누적 비용
      </p>
    </div>
  )
}
