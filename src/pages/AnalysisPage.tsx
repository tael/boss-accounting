import BreakEvenCalc from '@/components/analysis/BreakEvenCalc'
import ExpensePieChart from '@/components/analysis/ExpensePieChart'
import TrendChart from '@/components/analysis/TrendChart'
import { BOOK_REFERENCES } from '@/constants/bookReferences'

export default function AnalysisPage() {
  const bepRef = BOOK_REFERENCES['analysis.breakEven']
  const expenseRef = BOOK_REFERENCES['analysis.expenseStructure']
  const trendRef = BOOK_REFERENCES['analysis.trend']

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900">분석</h1>

      <div className="space-y-1">
        <BreakEvenCalc />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {bepRef.chapter} — {bepRef.title}
        </p>
      </div>

      <div className="space-y-1">
        <ExpensePieChart />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {expenseRef.chapter} — {expenseRef.title}
        </p>
      </div>

      <div className="space-y-1">
        <TrendChart />
        <p className="text-xs text-gray-400 px-1">
          참고: 챕터 {trendRef.chapter} — {trendRef.title}
        </p>
      </div>
    </div>
  )
}
