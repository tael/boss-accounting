import { useState, useMemo } from 'react'
import { calculateLaborCost, calculateTrueLaborCost } from '@/utils/tax'
import type { LaborCostResult, TrueLaborCostResult } from '@/utils/tax'
import { formatKRW, parseKRW } from '@/utils/format'
import { useTransactionStore } from '@/stores/transactionStore'

function isTrueLaborCost(result: LaborCostResult | TrueLaborCostResult): result is TrueLaborCostResult {
  return 'trueMonthlyCost' in result
}

export default function LaborCalc() {
  const [hourlyWageInput, setHourlyWageInput] = useState('')
  const [weeklyHours, setWeeklyHours] = useState(40)
  const [includeInsurance, setIncludeInsurance] = useState(false)
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const [registered, setRegistered] = useState(false)

  const hourlyWage = parseKRW(hourlyWageInput) || 0

  const result = useMemo((): LaborCostResult | TrueLaborCostResult | null => {
    if (hourlyWage <= 0 || weeklyHours <= 0) return null
    return includeInsurance
      ? calculateTrueLaborCost(hourlyWage, weeklyHours)
      : calculateLaborCost(hourlyWage, weeklyHours)
  }, [hourlyWage, weeklyHours, includeInsurance])

  const trueResult = result && isTrueLaborCost(result) ? result : null

  function handleRegister() {
    if (!result) return
    const today = new Date().toISOString().slice(0, 10)
    const amount = trueResult ? trueResult.trueMonthlyCost : result.totalMonthlyPay
    const memoSuffix = trueResult ? ', 4대보험 포함' : ''
    addTransaction({
      type: 'expense',
      date: today,
      amountKRW: amount,
      categoryId: 'expense-labor',
      memo: `알바 인건비 (시급 ${formatKRW(hourlyWage)}, 주${weeklyHours}시간${memoSuffix})`,
      isVatDeductible: false,
    })
    setRegistered(true)
    setTimeout(() => setRegistered(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">알바 인건비 계산기 (주휴수당 포함)</h2>

      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">시급 (원)</label>
          <input
            type="text"
            value={hourlyWageInput}
            onChange={(e) => setHourlyWageInput(e.target.value)}
            placeholder="예: 10,030"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            주당 근무시간 ({weeklyHours}시간)
          </label>
          <input
            type="number"
            min={1}
            max={40}
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Math.min(40, Math.max(1, Number(e.target.value))))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">4대 보험 포함</span>
          <button
            type="button"
            role="switch"
            aria-checked={includeInsurance}
            onClick={() => setIncludeInsurance((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              includeInsurance ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeInsurance ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {result ? (
        <>
          {!result.isEligible && (
            <div className="mb-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-2.5 text-xs text-yellow-700">
              주 15시간 미만이므로 주휴수당이 발생하지 않습니다.
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">기본 주급</span>
              <span className="text-sm font-medium text-gray-700">{formatKRW(result.baseWeeklyPay)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">주휴수당</span>
              <span className="text-sm font-medium text-gray-700">
                {result.isEligible ? formatKRW(result.weeklyHolidayPay) : '해당 없음'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-800">주 합계</span>
              <span className="text-sm font-bold text-gray-800">{formatKRW(result.totalWeeklyPay)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-800">월 환산 합계</span>
              <span className="text-base font-bold text-blue-600">{formatKRW(result.totalMonthlyPay)}</span>
            </div>
            <p className="text-xs text-gray-400">월 환산 = 주 합계 × 4.345주</p>

            {trueResult && (
              <>
                <div className="pt-3 border-t border-gray-200 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-500 mb-1">사업주 부담 4대 보험 (월)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">국민연금 (4.5%)</span>
                    <span className="text-xs text-gray-700">{formatKRW(trueResult.nationalPension)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">건강보험 (3.545%)</span>
                    <span className="text-xs text-gray-700">{formatKRW(trueResult.healthInsurance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">고용보험 (0.9%)</span>
                    <span className="text-xs text-gray-700">{formatKRW(trueResult.employmentInsurance)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">산재보험 (1.8%)</span>
                    <span className="text-xs text-gray-700">{formatKRW(trueResult.industrialAccident)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-600">보험 합계</span>
                    <span className="text-xs font-semibold text-gray-700">{formatKRW(trueResult.totalInsurance)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-100 bg-blue-50 -mx-4 px-4 py-2 rounded-b-lg">
                  <span className="text-sm font-bold text-blue-800">실질 월 총 인건비</span>
                  <span className="text-base font-bold text-blue-700">{formatKRW(trueResult.trueMonthlyCost)}</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleRegister}
            disabled={registered}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              registered
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {registered
              ? '거래 등록 완료!'
              : trueResult
                ? '거래로 등록 (실질 월 총 인건비)'
                : '거래로 등록 (월 환산 인건비)'}
          </button>
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          시급과 주당 근무시간을 입력하면 자동 계산됩니다.
        </div>
      )}
    </div>
  )
}
