import { useState, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import TransactionFilter from '@/components/transactions/TransactionFilter'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionForm from '@/components/transactions/TransactionForm'
import SmsParserInput from '@/components/transactions/SmsParserInput'
import BookReference from '@/components/transactions/BookReference'
import RecurringList from '@/components/recurring/RecurringList'
import { filterTransactions } from '@/utils/financial'
import type { TransactionFilter as FilterState } from '@/types/transaction'

export default function TransactionsPage() {
  const { transactions } = useTransactionStore()
  const [filter, setFilter] = useState<FilterState>({})
  const [showForm, setShowForm] = useState(false)
  const [showSmsParser, setShowSmsParser] = useState(false)

  const filtered = useMemo(() => filterTransactions(transactions, filter), [filter, transactions])

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const tx of filtered) {
      if (tx.type === 'income') income += tx.amountKRW
      else expense += tx.amountKRW
    }
    return { totalIncome: income, totalExpense: expense }
  }, [filtered])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">거래 기록</h1>
          <BookReference refKey="transactions.categories" />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setShowSmsParser(!showSmsParser); setShowForm(false) }}
            className={[
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm',
              showSmsParser
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            ].join(' ')}
          >
            문자 붙여넣기
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(true); setShowSmsParser(false) }}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            거래 추가
          </button>
        </div>
      </div>

      {/* 문자 파서 인라인 섹션 */}
      {showSmsParser && (
        <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">알림 문자로 거래 추가</h2>
          <SmsParserInput onSuccess={() => setShowSmsParser(false)} />
        </div>
      )}

      {/* 거래 추가 인라인 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">새 거래 입력</h2>
          <TransactionForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">총 거래 건수</p>
          <p className="text-lg font-bold text-gray-900">{filtered.length}건</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 text-center">
          <p className="text-xs text-emerald-600 mb-1">매출 합계</p>
          <p className="text-lg font-bold text-emerald-700">
            ₩{totalIncome.toLocaleString('ko-KR')}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <p className="text-xs text-red-500 mb-1">비용 합계</p>
          <p className="text-lg font-bold text-red-600">
            ₩{totalExpense.toLocaleString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 본문: 필터 + 목록 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 shrink-0">
          <TransactionFilter filter={filter} onChange={setFilter} />
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
            <BookReference refKey="transactions.expenseDeduction" />
            <span>필요경비 처리 안내</span>
          </div>
        </div>
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              {filtered.length}건의 거래
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <BookReference refKey="transactions.fixedVariable" />
              <span>고정비/변동비 구분</span>
            </div>
          </div>
          <TransactionList transactions={filtered} />
        </div>
      </div>

      {/* 반복 거래 템플릿 */}
      <RecurringList />
    </div>
  )
}
