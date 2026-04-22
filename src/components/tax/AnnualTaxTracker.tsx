import { useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { forecastAnnualTax } from '@/utils/tax'
import { formatKRW } from '@/utils/format'

export default function AnnualTaxTracker() {
  const transactions = useTransactionStore((s) => s.transactions)

  const forecast = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const currentMonthIndex = now.getMonth() + 1 // 1-12

    let income = 0
    let expense = 0
    for (const tx of transactions) {
      if (!tx.date.startsWith(String(year))) continue
      if (tx.type === 'income') income += tx.amountKRW
      else expense += tx.amountKRW
    }
    const netIncome = Math.max(0, income - expense)

    return forecastAnnualTax(netIncome, currentMonthIndex)
  }, [transactions])

  const hasData = forecast.currentNetIncomeKRW > 0

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-3">연말 세율 구간 추정</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          올해 거래 데이터가 없습니다. 거래를 입력하면 연말 과세표준을 자동으로 추정합니다.
        </div>
      </div>
    )
  }

  const currentRatePct = forecast.currentBracket
    ? (forecast.currentBracket.rate * 100).toFixed(0)
    : '—'
  const projectedRatePct = forecast.projectedBracket
    ? (forecast.projectedBracket.rate * 100).toFixed(0)
    : '—'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">연말 세율 구간 추정</h2>

      {/* 세율 구간 변경 경고 */}
      {forecast.willBracketChange && (
        <div className="mb-4 rounded-lg bg-orange-50 border border-orange-200 px-4 py-3">
          <p className="text-sm font-semibold text-orange-700 mb-0.5">세율 구간 상승 예상</p>
          <p className="text-sm text-orange-600">
            현재 {currentRatePct}% 구간이지만, 현재 추세대로라면 연말에 {projectedRatePct}% 구간으로 올라갑니다.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">올해 현재까지 순이익</span>
          <span className="text-sm font-medium text-gray-800">
            {formatKRW(forecast.currentNetIncomeKRW)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            연말 추정 소득
            <span className="text-xs text-gray-400 ml-1">
              (월 평균 × 12, {forecast.currentMonthIndex}월 기준)
            </span>
          </span>
          <span className="text-sm font-semibold text-blue-700">
            {formatKRW(forecast.projectedAnnualIncomeKRW)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">현재 세율 구간</span>
          <span className="text-sm font-medium text-gray-700">
            {currentRatePct}%
            {forecast.currentBracket && (
              <span className="text-xs text-gray-400 ml-1">
                ({formatKRW(forecast.currentBracket.minKRW)}
                {forecast.currentBracket.maxKRW
                  ? ` ~ ${formatKRW(forecast.currentBracket.maxKRW)}`
                  : ' 이상'})
              </span>
            )}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">연말 예상 세율 구간</span>
          <span
            className={`text-sm font-semibold ${
              forecast.willBracketChange ? 'text-orange-600' : 'text-gray-700'
            }`}
          >
            {projectedRatePct}%
            {forecast.projectedBracket && (
              <span className="text-xs text-gray-400 ml-1">
                ({formatKRW(forecast.projectedBracket.minKRW)}
                {forecast.projectedBracket.maxKRW
                  ? ` ~ ${formatKRW(forecast.projectedBracket.maxKRW)}`
                  : ' 이상'})
              </span>
            )}
          </span>
        </div>

        {/* 다음 구간까지 남은 금액 (현재 소득 기준) */}
        {forecast.amountToNextBracketKRW !== null && forecast.amountToNextBracketKRW > 0 && (
          <div className="flex justify-between items-center rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
            <span className="text-sm text-yellow-700">다음 세율 구간까지 남은 금액</span>
            <span className="text-sm font-semibold text-yellow-700">
              {formatKRW(forecast.amountToNextBracketKRW)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-sm font-bold text-gray-800">연말 예상 세액</span>
          <span className="text-base font-bold text-red-500">
            {formatKRW(forecast.projectedTaxKRW)}
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        소득공제 미적용 기준 간이 추정값입니다. 실제 세액은 공제 항목에 따라 달라집니다.
      </p>
    </div>
  )
}
