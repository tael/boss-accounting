import { useMemo } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { calculateBusinessHealth } from '@/utils/financial'
import type { BusinessHealthResult } from '@/utils/financial'

const GRADE_META: Record<
  BusinessHealthResult['grade'],
  { label: string; ringColor: string; textColor: string; bgColor: string; barColor: string }
> = {
  danger: {
    label: '위험',
    ringColor: 'border-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    barColor: 'bg-red-500',
  },
  warning: {
    label: '주의',
    ringColor: 'border-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    barColor: 'bg-orange-500',
  },
  good: {
    label: '양호',
    ringColor: 'border-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    barColor: 'bg-blue-500',
  },
  excellent: {
    label: '우수',
    ringColor: 'border-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    barColor: 'bg-green-500',
  },
}

interface ScoreBarProps {
  label: string
  value: number
  max: number
  barColor: string
}

function ScoreBar({ label, value, max, barColor }: ScoreBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-medium text-gray-700">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function HealthScoreWidget() {
  const transactions = useTransactionStore((s) => s.transactions)

  const health = useMemo(() => calculateBusinessHealth(transactions), [transactions])

  if (!health.hasData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 mb-3">사업 건강도</h2>
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">
            거래를 입력하면 건강도를 측정할 수 있어요
          </p>
        </div>
      </div>
    )
  }

  const meta = GRADE_META[health.grade]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-4">사업 건강도</h2>

      <div className="flex items-center gap-5 mb-4">
        <div
          className={`shrink-0 w-24 h-24 rounded-full border-4 ${meta.ringColor} ${meta.bgColor} flex flex-col items-center justify-center`}
        >
          <span className={`text-3xl font-bold ${meta.textColor}`}>{health.score}</span>
          <span className="text-[10px] text-gray-400 leading-none">/ 100</span>
        </div>
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor} mb-2`}
          >
            {meta.label}
          </span>
          <p className="text-sm text-gray-600 leading-relaxed">{health.summary}</p>
        </div>
      </div>

      <div className="space-y-3">
        <ScoreBar
          label="수익성 (이번 달 이익률)"
          value={health.profitabilityScore}
          max={40}
          barColor={meta.barColor}
        />
        <ScoreBar
          label="안정성 (최근 3개월 흑자)"
          value={health.stabilityScore}
          max={30}
          barColor={meta.barColor}
        />
        <ScoreBar
          label="성장성 (매출 추세)"
          value={health.growthScore}
          max={30}
          barColor={meta.barColor}
        />
      </div>
    </div>
  )
}
