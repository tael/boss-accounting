import { useState, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateIncomeTax, calculateYellowUmbrellaSaving } from '@/utils/tax'
import type { TaxDeductions } from '@/utils/tax'
import { formatKRW, parseKRW } from '@/utils/format'
import { CURRENT_TAX_RATES, TAX_DEDUCTION_CONSTANTS } from '@/constants/taxRates'

export default function IncomeTaxCalc() {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')
  const [manualInput, setManualInput] = useState('')
  const [deductionOpen, setDeductionOpen] = useState(false)
  const [deductions, setDeductions] = useState<TaxDeductions>({
    dependents: 1,
    nationalPension: 0,
    yellowUmbrella: 0,
  })
  const transactions = useTransactionStore((s) => s.transactions)

  const autoTaxable = useMemo(() => {
    let inc = 0
    let exp = 0
    const year = new Date().getFullYear()
    for (const tx of transactions) {
      if (!tx.date.startsWith(String(year))) continue
      if (tx.type === 'income') inc += tx.amountKRW
      else exp += tx.amountKRW
    }
    return Math.max(0, inc - exp)
  }, [transactions])

  const taxableKRW =
    mode === 'auto' ? autoTaxable : parseKRW(manualInput) || 0

  const result = taxableKRW > 0 ? calculateIncomeTax(taxableKRW, deductions) : null

  const brackets = CURRENT_TAX_RATES.incomeTaxBrackets

  const yellowUmbrellaApplied = Math.min(deductions.yellowUmbrella, TAX_DEDUCTION_CONSTANTS.YELLOW_UMBRELLA_MAX)
  const yellowUmbrellaSaving = result
    ? calculateYellowUmbrellaSaving(result, deductions)
    : 0

  function handleDeductionChange(field: keyof TaxDeductions, value: string) {
    const num = parseKRW(value)
    setDeductions((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : Math.max(0, num),
    }))
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">종합소득세 간이 계산기</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${
            mode === 'manual'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          직접 입력
        </button>
        <button
          onClick={() => setMode('auto')}
          className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${
            mode === 'auto'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          올해 매출-비용 자동
        </button>
      </div>

      {mode === 'manual' ? (
        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">과세표준 (원)</label>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="예: 50,000,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div className="mb-4 bg-blue-50 rounded-lg px-4 py-3 flex justify-between items-center">
          <span className="text-sm text-gray-600">올해 추정 과세표준</span>
          <span className="text-sm font-bold text-blue-700">{formatKRW(autoTaxable)}</span>
        </div>
      )}

      {/* 소득공제 입력 섹션 */}
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setDeductionOpen((v) => !v)}
          className="w-full flex justify-between items-center px-4 py-2.5 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium">소득공제 입력</span>
          <span className="text-gray-400 text-xs">{deductionOpen ? '▲ 접기' : '▼ 펼치기'}</span>
        </button>

        {deductionOpen && (
          <div className="px-4 py-3 space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                부양가족 수 (본인 포함)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={deductions.dependents}
                onChange={(e) => handleDeductionChange('dependents', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-0.5">
                1인당 150만원 공제 (본인 포함 {deductions.dependents}명 = {formatKRW(deductions.dependents * TAX_DEDUCTION_CONSTANTS.PERSONAL_DEDUCTION_PER_DEPENDENT)})
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                국민연금 납입액 (원, 연간)
              </label>
              <input
                type="text"
                value={deductions.nationalPension === 0 ? '' : deductions.nationalPension.toLocaleString()}
                onChange={(e) => handleDeductionChange('nationalPension', e.target.value)}
                placeholder="예: 2,160,000"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                노란우산공제 납입액 (원, 연간, 최대 500만원)
              </label>
              <input
                type="text"
                value={deductions.yellowUmbrella === 0 ? '' : deductions.yellowUmbrella.toLocaleString()}
                onChange={(e) => handleDeductionChange('yellowUmbrella', e.target.value)}
                placeholder="예: 5,000,000"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {yellowUmbrellaApplied > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">
                  적용 금액: {formatKRW(yellowUmbrellaApplied)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {result ? (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          {/* 공제 전/후 비교 */}
          {result.taxBeforeDeductionKRW !== result.calculatedTaxKRW && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">공제 전 세액</span>
              <span className="text-sm text-gray-400 line-through">
                {formatKRW(result.taxBeforeDeductionKRW)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">과세표준 (공제 후)</span>
            <span className="text-sm font-medium text-gray-700">
              {formatKRW(result.taxableIncomeKRW)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">적용 세율</span>
            <span className="text-sm font-medium text-orange-600">
              {result.appliedRatePct.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-800">산출세액</span>
            <span className="text-base font-bold text-red-500">
              {formatKRW(result.calculatedTaxKRW)}
            </span>
          </div>

          {/* 노란우산공제 절세액 강조 */}
          {deductions.yellowUmbrella > 0 && yellowUmbrellaSaving > 0 && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex justify-between items-center">
              <span className="text-sm text-green-700">노란우산공제로 절세</span>
              <span className="text-sm font-bold text-green-600">
                {formatKRW(yellowUmbrellaSaving)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          과세표준을 입력하면 자동 계산됩니다.
        </div>
      )}

      <details className="mt-4">
        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
          세율 구간 보기
        </summary>
        <div className="mt-2 space-y-1">
          {brackets.map((b, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-500">
              <span>
                {formatKRW(b.minKRW)} -{' '}
                {b.maxKRW ? formatKRW(b.maxKRW) : ''}
              </span>
              <span>{(b.rate * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
