import { useState } from 'react'
import { formatKRW, parseKRW } from '@/utils/format'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateCostStructure } from '@/utils/financial'

export default function BreakEvenCalc() {
  const transactions = useTransactionStore((s) => s.transactions)

  const [fixedCost, setFixedCost] = useState('')
  const [variableCost, setVariableCost] = useState('')
  const [autoSource, setAutoSource] = useState<{ from: string; to: string } | null>(null)

  const fixedCostKRW = parseKRW(fixedCost) || 0
  const variableCostKRW = parseKRW(variableCost) || 0

  // BEP 매출 기준 계산: BEP매출 = 고정비 / (1 - 변동비율)
  // 변동비율 = 변동비 / 매출 (매출 0이면 변동비/고정비 비율로 추정, 직접 입력 모드에선 0)
  // 직접 입력 모드: 변동비율 = variableCostKRW / (fixedCostKRW + variableCostKRW) (매출 미입력 시)
  const totalCost = fixedCostKRW + variableCostKRW
  const variableRatio = totalCost > 0 ? variableCostKRW / totalCost : 0
  const canCalculate = fixedCostKRW > 0 && variableRatio < 1

  const bepRevenue = canCalculate ? Math.ceil(fixedCostKRW / (1 - variableRatio)) : null

  function handleAutoLoad() {
    const result = calculateCostStructure(transactions, 3)
    if (result.avgFixedCost === 0 && result.avgVariableCost === 0) return

    setFixedCost(result.avgFixedCost.toLocaleString('ko-KR'))
    setVariableCost(result.avgVariableCost.toLocaleString('ko-KR'))
    setAutoSource(result.monthRange.from ? result.monthRange : null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">손익분기점 계산기</h2>
        <button
          type="button"
          onClick={handleAutoLoad}
          disabled={transactions.length === 0}
          className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          장부에서 자동 불러오기
        </button>
      </div>

      {autoSource && (
        <p className="text-xs text-gray-400 mb-3">
          최근 3개월 평균 ({autoSource.from} ~ {autoSource.to}) 기준
        </p>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">월 고정비 (원)</label>
          <input
            type="text"
            value={fixedCost}
            onChange={(e) => { setFixedCost(e.target.value); setAutoSource(null) }}
            placeholder="예: 2,000,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">월 변동비 (원)</label>
          <input
            type="text"
            value={variableCost}
            onChange={(e) => { setVariableCost(e.target.value); setAutoSource(null) }}
            placeholder="예: 500,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {canCalculate && bepRevenue !== null ? (
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">손익분기 매출액</span>
            <span className="text-base font-bold text-blue-700">{formatKRW(bepRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">변동비율</span>
            <span className="text-xs text-gray-600">{(variableRatio * 100).toFixed(1)}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 pt-2 border-t border-blue-100">
            이 금액 이상 매출이 나야 손해가 없습니다.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          {fixedCostKRW > 0 && variableRatio >= 1
            ? '변동비가 총비용을 초과하면 계산이 어렵습니다.'
            : '값을 입력하면 자동 계산됩니다.'}
        </div>
      )}
    </div>
  )
}
