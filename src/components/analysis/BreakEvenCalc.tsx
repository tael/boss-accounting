import { useState } from 'react'
import { formatKRW, parseKRW } from '@/utils/format'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateCostStructure, calculateBreakEven } from '@/utils/financial'

export default function BreakEvenCalc() {
  const transactions = useTransactionStore((s) => s.transactions)

  const [fixedCost, setFixedCost] = useState('')
  const [variableCost, setVariableCost] = useState('')
  const [autoSource, setAutoSource] = useState<{ from: string; to: string } | null>(null)

  const fixedCostKRW = parseKRW(fixedCost) || 0
  const variableCostKRW = parseKRW(variableCost) || 0

  const { bepRevenue: rawBepRevenue, variableRatio, isInfeasible } = calculateBreakEven(
    fixedCostKRW,
    variableCostKRW,
  )
  const canCalculate = fixedCostKRW > 0
  const bepRevenue = isInfeasible ? -1 : rawBepRevenue

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

      {transactions.length === 0 && (
        <p className="text-xs text-gray-400 mb-3">
          거래 데이터를 먼저 입력하면 현재 비용 구조를 자동으로 불러올 수 있어요.
        </p>
      )}

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

      {canCalculate && bepRevenue !== null && bepRevenue !== -1 ? (
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
      ) : canCalculate && bepRevenue === -1 ? (
        <div className="bg-orange-50 rounded-lg p-4 text-center text-sm text-orange-600">
          현재 비용 구조로는 BEP 달성 불가
        </div>
      ) : canCalculate && bepRevenue === null ? (
        <div className="bg-red-50 rounded-lg p-4 text-center text-sm text-red-500">
          계산 불가 — 입력값을 다시 확인해 주세요.
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          값을 입력하면 자동 계산됩니다.
        </div>
      )}
    </div>
  )
}
