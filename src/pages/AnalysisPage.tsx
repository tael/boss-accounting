import BreakEvenCalc from '@/components/analysis/BreakEvenCalc'
import BudgetTracker from '@/components/analysis/BudgetTracker'
import ExpensePieChart from '@/components/analysis/ExpensePieChart'
import TrendChart from '@/components/analysis/TrendChart'
import YoYChart from '@/components/analysis/YoYChart'
import { BOOK_REFERENCES } from '@/constants/bookReferences'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export default function AnalysisPage() {
  const bepRef = BOOK_REFERENCES['analysis.breakEven']
  const expenseRef = BOOK_REFERENCES['analysis.expenseStructure']
  const trendRef = BOOK_REFERENCES['analysis.trend']
  const yoyRef = BOOK_REFERENCES['analysis.trend']

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">분석</h1>

      <div className="space-y-1">
        <BreakEvenCalc />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {bepRef.chapter} — {bepRef.title}
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
          <ExpensePieChart />
          <p className="text-xs text-gray-400 px-1">
            참고: 챕터 {expenseRef.chapter} — {expenseRef.title}
          </p>
        </div>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="bg-white rounded-xl border border-red-200 p-5 text-center text-sm text-red-400">
            차트를 불러오는 중 오류가 발생했습니다.
          </div>
        }
      >
        <div className="space-y-1">
          <TrendChart />
          <p className="text-xs text-gray-400 px-1">
            참고: 챕터 {trendRef.chapter} — {trendRef.title}
          </p>
        </div>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="bg-white rounded-xl border border-red-200 p-5 text-center text-sm text-red-400">
            차트를 불러오는 중 오류가 발생했습니다.
          </div>
        }
      >
        <div className="space-y-1">
          <YoYChart />
          <p className="text-xs text-gray-400 px-1">
            참고: 챕터 {yoyRef.chapter} — {yoyRef.title}
          </p>
        </div>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div className="bg-white rounded-xl border border-red-200 p-5 text-center text-sm text-red-400">
            예산 트래커를 불러오는 중 오류가 발생했습니다.
          </div>
        }
      >
        <BudgetTracker />
      </ErrorBoundary>
    </div>
  )
}
