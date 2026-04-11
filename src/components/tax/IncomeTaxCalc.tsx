import { useState, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateIncomeTax } from '@/utils/tax'
import { formatKRW, parseKRW } from '@/utils/format'
import { CURRENT_TAX_RATES } from '@/constants/taxRates'

export default function IncomeTaxCalc() {
  const [mode, setMode] = useState<'manual' | 'auto'>('manual')
  const [manualInput, setManualInput] = useState('')
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

  const result = taxableKRW > 0 ? calculateIncomeTax(taxableKRW) : null

  const brackets = CURRENT_TAX_RATES.incomeTaxBrackets

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

      {result ? (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">과세표준</span>
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
                {formatKRW(b.minKRW)} ~{' '}
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
