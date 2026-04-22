import { useState, useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateCostStructure, calculateBreakEven } from '@/utils/financial'
import { formatKRW } from '@/utils/format'

interface Preset {
  label: string
  deltaFixed: number
}

const PRESETS: Preset[] = [
  { label: '직원 1명 추가 (+180만원)', deltaFixed: 1_800_000 },
  { label: '임대료 인상 (+50만원)', deltaFixed: 500_000 },
  { label: '마케팅 예산 (+100만원)', deltaFixed: 1_000_000 },
]

export default function WhatIfSimulator() {
  const transactions = useTransactionStore((s) => s.transactions)

  const base = useMemo(() => calculateCostStructure(transactions, 3), [transactions])

  const [deltaFixed, setDeltaFixed] = useState(0)
  const [inputValue, setInputValue] = useState('0')

  const scenarioFixed = base.avgFixedCost + deltaFixed
  const scenarioVariable = base.avgVariableCost

  const baseResult = useMemo(
    () => calculateBreakEven(base.avgFixedCost, base.avgVariableCost, base.avgRevenue),
    [base],
  )

  const scenarioResult = useMemo(
    () => calculateBreakEven(scenarioFixed, scenarioVariable, base.avgRevenue),
    [scenarioFixed, scenarioVariable, base.avgRevenue],
  )

  const canAchieve =
    scenarioResult.bepRevenue !== null &&
    !scenarioResult.isInfeasible &&
    base.avgRevenue >= scenarioResult.bepRevenue

  function applyPreset(delta: number) {
    setDeltaFixed(delta)
    setInputValue((delta / 10_000).toString())
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setInputValue(raw)
    const parsed = parseFloat(raw)
    if (!isNaN(parsed)) {
      setDeltaFixed(Math.round(parsed * 10_000))
    }
  }

  const hasData = transactions.length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-1">What-if 손익 시뮬레이터</h2>
      <p className="text-xs text-gray-400 mb-4">고정비 변화 시나리오에 따른 새로운 BEP를 확인합니다.</p>

      {!hasData && (
        <p className="text-xs text-gray-400 mb-3">
          거래 데이터를 먼저 입력하면 현재 비용 구조를 자동으로 불러올 수 있어요.
        </p>
      )}

      {/* 현재 기준값 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
        <p className="text-xs font-medium text-gray-500 mb-2">
          최근 3개월 평균 기준
          {base.monthRange.from && (
            <span className="font-normal ml-1">
              ({base.monthRange.from} ~ {base.monthRange.to})
            </span>
          )}
        </p>
        <div className="flex justify-between text-xs text-gray-600">
          <span>월 평균 고정비</span>
          <span className="tabular-nums">{formatKRW(base.avgFixedCost)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>월 평균 변동비</span>
          <span className="tabular-nums">{formatKRW(base.avgVariableCost)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>월 평균 매출</span>
          <span className="tabular-nums">{formatKRW(base.avgRevenue)}</span>
        </div>
        {baseResult.bepRevenue !== null && !baseResult.isInfeasible && (
          <div className="flex justify-between text-xs text-blue-600 pt-1 border-t border-gray-200 mt-1">
            <span>현재 BEP</span>
            <span className="tabular-nums font-semibold">{formatKRW(baseResult.bepRevenue)}</span>
          </div>
        )}
      </div>

      {/* 프리셋 버튼 */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">시나리오 프리셋</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.deltaFixed)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                deltaFixed === preset.deltaFixed
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 슬라이더 + 직접 입력 */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-500">고정비 변화 (만원)</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              className="w-24 px-2 py-1 text-xs text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 tabular-nums"
            />
            <span className="text-xs text-gray-400">만원</span>
          </div>
        </div>
        <input
          type="range"
          min={-500}
          max={1000}
          step={10}
          value={deltaFixed / 10_000}
          onChange={(e) => {
            const val = parseFloat(e.target.value)
            setDeltaFixed(Math.round(val * 10_000))
            setInputValue(val.toString())
          }}
          className="w-full accent-orange-500"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>-500만원</span>
          <span>0</span>
          <span>+1,000만원</span>
        </div>
      </div>

      {/* 시나리오 결과 */}
      <div className="rounded-lg p-4 space-y-3 border border-orange-100 bg-orange-50">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">시나리오 고정비</span>
          <span className="text-sm tabular-nums font-medium text-gray-800">
            {formatKRW(scenarioFixed)}
          </span>
        </div>

        {scenarioResult.isInfeasible ? (
          <div className="text-center py-2 text-sm text-orange-600 font-medium">
            BEP 달성 불가 — 변동비율이 너무 높습니다
          </div>
        ) : scenarioResult.bepRevenue === null ? (
          <div className="text-center py-2 text-sm text-gray-400">
            고정비 값을 입력하면 계산됩니다
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">새로운 BEP 매출</span>
              <span className="text-base font-bold text-orange-700 tabular-nums">
                {formatKRW(scenarioResult.bepRevenue)}
              </span>
            </div>

            {baseResult.bepRevenue !== null && !baseResult.isInfeasible && (
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>BEP 변화</span>
                <span className={`tabular-nums font-medium ${deltaFixed > 0 ? 'text-red-500' : deltaFixed < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {deltaFixed === 0
                    ? '변화 없음'
                    : `${deltaFixed > 0 ? '+' : ''}${formatKRW(scenarioResult.bepRevenue - baseResult.bepRevenue)}`}
                </span>
              </div>
            )}

            <div
              className={`rounded-lg px-4 py-3 text-center text-sm font-semibold ${
                canAchieve
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {canAchieve
                ? '현재 매출로 달성 가능'
                : base.avgRevenue === 0
                ? '매출 데이터 없음 — 거래를 입력해주세요'
                : '현재 매출로 달성 불가'}
            </div>

            {!canAchieve && base.avgRevenue > 0 && scenarioResult.bepRevenue !== null && (
              <p className="text-xs text-gray-400 text-center">
                BEP 달성까지 추가 매출{' '}
                <span className="font-medium text-gray-600 tabular-nums">
                  {formatKRW(scenarioResult.bepRevenue - base.avgRevenue)}
                </span>{' '}
                필요
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
