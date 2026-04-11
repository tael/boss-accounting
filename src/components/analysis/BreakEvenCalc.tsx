import { useState } from 'react'
import { formatKRW, parseKRW } from '@/utils/format'

export default function BreakEvenCalc() {
  const [fixedCost, setFixedCost] = useState('')
  const [variableCost, setVariableCost] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')

  const fixedCostKRW = parseKRW(fixedCost) || 0
  const variableCostKRW = parseKRW(variableCost) || 0
  const sellingPriceKRW = parseKRW(sellingPrice) || 0

  const contributionMargin = sellingPriceKRW - variableCostKRW
  const canCalculate = contributionMargin > 0 && fixedCostKRW > 0

  const bepUnits = canCalculate ? Math.ceil(fixedCostKRW / contributionMargin) : null
  const bepRevenue = bepUnits !== null ? bepUnits * sellingPriceKRW : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">손익분기점 계산기</h2>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">월 고정비 (원)</label>
          <input
            type="text"
            value={fixedCost}
            onChange={(e) => setFixedCost(e.target.value)}
            placeholder="예: 2,000,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">단위당 변동비 (원)</label>
          <input
            type="text"
            value={variableCost}
            onChange={(e) => setVariableCost(e.target.value)}
            placeholder="예: 30,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">단위당 판매가 (원)</label>
          <input
            type="text"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="예: 50,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {canCalculate && bepUnits !== null && bepRevenue !== null ? (
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">손익분기 판매량</span>
            <span className="text-base font-bold text-blue-700">
              {bepUnits.toLocaleString('ko-KR')}개
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">손익분기 매출액</span>
            <span className="text-base font-bold text-blue-700">{formatKRW(bepRevenue)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            공헌이익 = {formatKRW(contributionMargin)} / 단위
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          {fixedCostKRW > 0 && variableCostKRW > 0 && sellingPriceKRW > 0 && !canCalculate
            ? '판매가가 변동비보다 커야 계산됩니다.'
            : '값을 입력하면 자동 계산됩니다.'}
        </div>
      )}
    </div>
  )
}
