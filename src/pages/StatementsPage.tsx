import IncomeStatement from '@/components/statements/IncomeStatement'
import CashFlowChart from '@/components/statements/CashFlowChart'
import BalanceSnapshot from '@/components/statements/BalanceSnapshot'
import { BOOK_REFERENCES } from '@/constants/bookReferences'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function StatementsPage() {
  const incomeRef = BOOK_REFERENCES['statements.incomeStatement']
  const cashFlowRef = BOOK_REFERENCES['statements.cashFlow']
  const balanceRef = BOOK_REFERENCES['statements.balanceSheet']

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">재무제표</h1>

      <div className="space-y-1">
        <IncomeStatement />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {incomeRef.chapter} — {incomeRef.title}
        </p>
      </div>

      <ErrorBoundary
        fallback={
          <div className="bg-white rounded-xl border border-red-200 p-5 text-center text-sm text-red-400">
            차트를 불러오는 중 오류가 발생했습니다.
          </div>
        }
      >
        <div className="space-y-1">
          <CashFlowChart />
          <p className="text-xs text-gray-400 px-1">
            참고: 챕터 {cashFlowRef.chapter} — {cashFlowRef.title}
          </p>
        </div>
      </ErrorBoundary>

      <div className="space-y-1">
        <BalanceSnapshot />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {balanceRef.chapter} — {balanceRef.title}
        </p>
      </div>
    </div>
  )
}
