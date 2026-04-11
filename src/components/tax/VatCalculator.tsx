import { useState } from 'react'
import { calculateVAT } from '@/utils/tax'
import { formatKRW, parseKRW } from '@/utils/format'

export default function VatCalculator() {
  const [revenue, setRevenue] = useState('')
  const [purchase, setPurchase] = useState('')

  const revenueKRW = parseKRW(revenue) || 0
  const purchaseKRW = parseKRW(purchase) || 0
  const canCalc = revenueKRW > 0 || purchaseKRW > 0

  const result = canCalc ? calculateVAT(revenueKRW, purchaseKRW) : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">부가세 계산기</h2>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">매출액 (원, VAT 제외)</label>
          <input
            type="text"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="예: 10,000,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">매입액 (원, VAT 제외)</label>
          <input
            type="text"
            value={purchase}
            onChange={(e) => setPurchase(e.target.value)}
            placeholder="예: 5,000,000"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">매출세액 (10%)</span>
            <span className="text-sm font-medium text-blue-600">
              {formatKRW(result.outputVatKRW)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">매입세액 (10%)</span>
            <span className="text-sm font-medium text-green-600">
              - {formatKRW(result.inputVatKRW)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-sm font-bold text-gray-800">
              {result.payableVatKRW >= 0 ? '납부세액' : '환급세액'}
            </span>
            <span
              className={`text-base font-bold ${
                result.payableVatKRW >= 0 ? 'text-red-500' : 'text-green-600'
              }`}
            >
              {formatKRW(Math.abs(result.payableVatKRW))}
            </span>
          </div>
        </div>
      )}
      {!result && (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
          금액을 입력하면 자동 계산됩니다.
        </div>
      )}
    </div>
  )
}
