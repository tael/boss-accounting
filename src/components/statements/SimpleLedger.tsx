import { useState, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { filterByMonth, filterByDateRange, getQuarterDateRange } from '@/utils/financial'
import { formatKRWNoSymbol } from '@/utils/format'
import type { Transaction } from '@/types/transaction'

type PeriodType = 'this-month' | 'last-month' | 'this-quarter'

function getPeriodLabel(period: PeriodType): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1

  if (period === 'this-month') return `${y}년 ${m}월`
  if (period === 'last-month') {
    const d = new Date(y, m - 2, 1)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
  }
  const q = Math.ceil(m / 3)
  return `${y}년 ${q}분기`
}

function getFilteredTransactions(transactions: Transaction[], period: PeriodType): Transaction[] {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth() + 1

  if (period === 'this-month') {
    const ym = `${y}-${String(m).padStart(2, '0')}`
    return filterByMonth(transactions, ym)
  }
  if (period === 'last-month') {
    const d = new Date(y, m - 2, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return filterByMonth(transactions, ym)
  }
  // this-quarter
  const q = Math.ceil(m / 3)
  const { from, to } = getQuarterDateRange(y, q)
  return filterByDateRange(transactions, from, to)
}

export default function SimpleLedger() {
  const transactions = useTransactionStore((s) => s.transactions)
  const [period, setPeriod] = useState<PeriodType>('this-month')

  const filtered = useMemo(
    () =>
      getFilteredTransactions(transactions, period).sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    [transactions, period],
  )

  const totalIncome = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amountKRW, 0)

  const totalExpense = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amountKRW, 0)

  const periodLabel = getPeriodLabel(period)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 no-print">
        <h2 className="text-base font-semibold text-gray-800">간편장부</h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            {(['this-month', 'last-month', 'this-quarter'] as PeriodType[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p === 'this-month' ? '이번 달' : p === 'last-month' ? '전월' : '이번 분기'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            인쇄
          </button>
        </div>
      </div>

      {/* 인쇄용 헤더 */}
      <div className="hidden print:block mb-4 text-center">
        <h1 className="text-lg font-bold">간편장부</h1>
        <p className="text-sm text-gray-600">{periodLabel}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          해당 기간의 거래 내역이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse simple-ledger-table">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium w-28">날짜</th>
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">거래 내용</th>
                <th className="text-right py-2 px-2 text-xs text-gray-500 font-medium w-32">수입 금액</th>
                <th className="text-right py-2 px-2 text-xs text-gray-500 font-medium w-32">지출 금액</th>
                <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium w-36">비고</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2 text-gray-600 tabular-nums">{tx.date}</td>
                  <td className="py-2 px-2 text-gray-800">
                    {tx.memo || (tx.type === 'income' ? '수입' : '지출')}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-green-700">
                    {tx.type === 'income' ? formatKRWNoSymbol(tx.amountKRW) : ''}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-red-600">
                    {tx.type === 'expense' ? formatKRWNoSymbol(tx.amountKRW) : ''}
                  </td>
                  <td className="py-2 px-2 text-gray-400 text-xs"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-2 px-2 text-xs font-semibold text-gray-700" colSpan={2}>
                  합계
                </td>
                <td className="py-2 px-2 text-right tabular-nums font-semibold text-green-700">
                  {formatKRWNoSymbol(totalIncome)}
                </td>
                <td className="py-2 px-2 text-right tabular-nums font-semibold text-red-600">
                  {formatKRWNoSymbol(totalExpense)}
                </td>
                <td className="py-2 px-2"></td>
              </tr>
              <tr className="bg-blue-50">
                <td className="py-2 px-2 text-xs font-semibold text-gray-700" colSpan={2}>
                  순이익
                </td>
                <td
                  className={`py-2 px-2 text-right tabular-nums font-bold text-sm ${
                    totalIncome - totalExpense >= 0 ? 'text-blue-700' : 'text-red-600'
                  }`}
                  colSpan={2}
                >
                  {formatKRWNoSymbol(totalIncome - totalExpense)}
                </td>
                <td className="py-2 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
