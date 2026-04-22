import { useState } from 'react'
import { calculateVAT, SIMPLIFIED_VAT_RATE_LABELS } from '@/utils/tax'
import { formatKRW, parseKRW } from '@/utils/format'
import { filterByQuarter, summarizeForVat } from '@/utils/financial'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'

export default function VatCalculator() {
  const taxType = useSettingsStore((s) => s.taxType)
  const transactions = useTransactionStore((s) => s.transactions)

  const isSimplified = taxType === 'simplified'

  // 일반과세자 상태
  const [revenue, setRevenue] = useState('')
  const [purchase, setPurchase] = useState('')

  // 간이과세자 상태
  const [simplifiedRevenue, setSimplifiedRevenue] = useState('')
  const [simplifiedIndustry, setSimplifiedIndustry] = useState('retail')

  /** 이번 분기 매출/적격증빙 비용 자동 불러오기 */
  const handleLoadFromTransactions = () => {
    const now = new Date()
    const year = now.getFullYear()
    const quarter = Math.floor(now.getMonth() / 3) + 1
    const txs = filterByQuarter(transactions, year, quarter)
    const { totalRevenue, totalDeductible } = summarizeForVat(txs)

    if (isSimplified) {
      setSimplifiedRevenue(String(totalRevenue))
    } else {
      setRevenue(String(totalRevenue))
      setPurchase(String(totalDeductible))
    }
  }

  // 일반과세자 계산
  const revenueKRW = parseKRW(revenue) || 0
  const purchaseKRW = parseKRW(purchase) || 0
  const canCalcGeneral = revenueKRW > 0 || purchaseKRW > 0
  const generalResult = canCalcGeneral
    ? calculateVAT(revenueKRW, purchaseKRW)
    : null

  // 간이과세자 계산
  const simplifiedRevenueKRW = parseKRW(simplifiedRevenue) || 0
  const canCalcSimplified = simplifiedRevenueKRW > 0
  const simplifiedResult = canCalcSimplified
    ? calculateVAT({ revenue: simplifiedRevenueKRW, deductibleExpenses: 0, taxType: 'simplified', simplifiedIndustry })
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">부가세 계산기</h2>
        {taxType === 'simplified' && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            간이과세자
          </span>
        )}
        {taxType === 'general' && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            일반과세자
          </span>
        )}
      </div>

      {/* 자동 불러오기 버튼 */}
      <button
        type="button"
        onClick={handleLoadFromTransactions}
        className="w-full mb-4 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        이번 분기 거래에서 자동 불러오기
      </button>

      {/* 일반과세자 UI */}
      {!isSimplified && (
        <>
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
              <label className="block text-xs text-gray-500 mb-1">
                적격증빙 매입액 (원, VAT 제외)
              </label>
              <input
                type="text"
                value={purchase}
                onChange={(e) => setPurchase(e.target.value)}
                placeholder="예: 5,000,000"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                세금계산서 · 신용카드 등 적격증빙 수취 매입액만 입력하세요.
              </p>
            </div>
          </div>

          {generalResult && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">매출세액 (10%)</span>
                <span className="text-sm font-medium text-blue-600">
                  {formatKRW(generalResult.outputVatKRW)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">매입세액 (10%)</span>
                <span className="text-sm font-medium text-green-600">
                  - {formatKRW(generalResult.inputVatKRW)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-800">
                  {generalResult.payableVatKRW >= 0 ? '납부세액' : '환급세액'}
                </span>
                <span
                  className={`text-base font-bold ${
                    generalResult.payableVatKRW >= 0 ? 'text-red-500' : 'text-green-600'
                  }`}
                >
                  {formatKRW(Math.abs(generalResult.payableVatKRW))}
                </span>
              </div>
            </div>
          )}
          {!generalResult && (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
              금액을 입력하면 자동 계산됩니다.
            </div>
          )}
        </>
      )}

      {/* 간이과세자 UI */}
      {isSimplified && (
        <>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">매출액 (원, VAT 포함)</label>
              <input
                type="text"
                value={simplifiedRevenue}
                onChange={(e) => setSimplifiedRevenue(e.target.value)}
                placeholder="예: 10,000,000"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">업종</label>
              <select
                value={simplifiedIndustry}
                onChange={(e) => setSimplifiedIndustry(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {Object.entries(SIMPLIFIED_VAT_RATE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {simplifiedResult && (
            <div className="bg-amber-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">매출액</span>
                <span className="text-sm font-medium text-gray-700">
                  {formatKRW(simplifiedRevenueKRW)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  부가가치율 ({((simplifiedResult.simplifiedRate ?? 0) * 100).toFixed(0)}%)
                </span>
                <span className="text-sm font-medium text-gray-700">
                  × {((simplifiedResult.simplifiedRate ?? 0) * 100).toFixed(0)}% × 10%
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                <span className="text-sm font-bold text-gray-800">납부세액</span>
                <span className="text-base font-bold text-red-500">
                  {formatKRW(simplifiedResult.payableVatKRW)}
                </span>
              </div>
            </div>
          )}
          {!simplifiedResult && (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-400">
              매출액을 입력하면 자동 계산됩니다.
            </div>
          )}
        </>
      )}
    </div>
  )
}
