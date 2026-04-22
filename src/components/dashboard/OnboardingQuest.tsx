/**
 * 온보딩 퀘스트 체크리스트 위젯
 * 신규 사용자가 주요 기능을 발견하도록 안내
 */

import { useTransactionStore } from '@/stores/transactionStore'
import { useRecurringStore } from '@/stores/recurringStore'
import { useSettingsStore } from '@/stores/settingsStore'

interface Quest {
  id: string
  label: string
  /** true면 스토어 데이터로 자동 판정, false면 수동 체크만 가능 */
  auto: boolean
}

const QUESTS: Quest[] = [
  { id: 'first-transaction', label: '첫 거래 입력하기', auto: true },
  { id: 'set-goal', label: '이번 달 목표 설정하기', auto: true },
  { id: 'view-analysis', label: '분석 페이지 방문하기', auto: false },
  { id: 'export-backup', label: 'JSON 백업 내보내기', auto: false },
  { id: 'recurring-setup', label: '고정 거래 템플릿 등록하기', auto: true },
]

export default function OnboardingQuest() {
  const transactions = useTransactionStore((s) => s.transactions)
  const templates = useRecurringStore((s) => s.templates)
  const { monthlyProfitGoalKRW, questCompleted, updateSettings } = useSettingsStore()

  /** 자동 완료 조건 판정 */
  function isAutoCompleted(id: string): boolean {
    switch (id) {
      case 'first-transaction':
        return transactions.length > 0
      case 'set-goal':
        return monthlyProfitGoalKRW > 0
      case 'recurring-setup':
        return templates.length > 0
      default:
        return false
    }
  }

  function isCompleted(id: string): boolean {
    const quest = QUESTS.find((q) => q.id === id)
    if (!quest) return false
    if (quest.auto) return isAutoCompleted(id)
    return questCompleted.includes(id)
  }

  function handleManualCheck(id: string) {
    if (questCompleted.includes(id)) return
    updateSettings({ questCompleted: [...questCompleted, id] })
  }

  const completedCount = QUESTS.filter((q) => isCompleted(q.id)).length
  const total = QUESTS.length
  const progressPct = Math.round((completedCount / total) * 100)

  // 모두 완료 시 숨김 (부모에서도 체크하지만 방어적으로)
  if (completedCount === total) return null

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">시작 가이드</h2>
        <span className="text-xs text-gray-400">{completedCount}/{total} 완료</span>
      </div>

      {/* 프로그레스바 */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 퀘스트 목록 */}
      <ul className="space-y-2">
        {QUESTS.map((quest) => {
          const done = isCompleted(quest.id)
          return (
            <li key={quest.id} className="flex items-center gap-3">
              <button
                type="button"
                disabled={quest.auto || done}
                onClick={() => handleManualCheck(quest.id)}
                className={[
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  done
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : quest.auto
                      ? 'border-gray-300 bg-gray-50 cursor-default'
                      : 'border-gray-300 hover:border-blue-400 cursor-pointer',
                ].join(' ')}
                aria-label={done ? `${quest.label} 완료` : `${quest.label} 완료 표시`}
              >
                {done && (
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span
                className={[
                  'text-sm',
                  done ? 'line-through text-gray-400' : 'text-gray-700',
                ].join(' ')}
              >
                {quest.label}
                {!quest.auto && !done && (
                  <span className="ml-1.5 text-xs text-gray-400">(직접 체크)</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
