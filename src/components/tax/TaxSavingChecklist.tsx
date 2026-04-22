import { useState } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { TAX_SAVING_ITEMS, TaxSavingItem } from '@/constants/taxSavingItems'

function formatKRW(amount: number): string {
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`
  }
  return `${amount.toLocaleString()}원`
}

function InfoTooltip({ description }: { description: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-block">
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center hover:bg-gray-300 focus:outline-none"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="설명 보기"
      >
        ?
      </button>
      {visible && (
        <span className="absolute left-6 top-0 z-10 w-56 rounded-lg bg-gray-800 text-white text-xs px-3 py-2 shadow-lg leading-relaxed">
          {description}
        </span>
      )}
    </span>
  )
}

function ChecklistRow({ item, checked, onToggle }: { item: TaxSavingItem; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${checked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {item.title}
          </span>
          <InfoTooltip description={item.description} />
          {item.estimatedSavingKRW != null && (
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full ml-auto whitespace-nowrap">
              절세 {formatKRW(item.estimatedSavingKRW)}
            </span>
          )}
        </div>
      </div>
    </label>
  )
}

export default function TaxSavingChecklist() {
  const checklist = useSettingsStore((s) => s.taxSavingChecklist)
  const updateSettings = useSettingsStore((s) => s.updateSettings)

  const total = TAX_SAVING_ITEMS.length
  const completedCount = checklist.length
  const progressPercent = total === 0 ? 0 : Math.round((completedCount / total) * 100)

  const estimatedSaving = TAX_SAVING_ITEMS.filter((item) => checklist.includes(item.id) && item.estimatedSavingKRW != null).reduce(
    (sum, item) => sum + (item.estimatedSavingKRW ?? 0),
    0,
  )

  function handleToggle(id: string) {
    const next = checklist.includes(id)
      ? checklist.filter((x) => x !== id)
      : [...checklist, id]
    updateSettings({ taxSavingChecklist: next })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">절세 체크리스트</h2>
        <span className="text-sm text-gray-500">
          {completedCount}/{total}
        </span>
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>진행률</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 예상 절세액 */}
      {estimatedSaving > 0 && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm text-green-700">완료 항목 예상 절세액</span>
          <span className="text-sm font-semibold text-green-700">{formatKRW(estimatedSaving)}</span>
        </div>
      )}

      {/* 항목 목록 */}
      <div className="space-y-1">
        {TAX_SAVING_ITEMS.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            checked={checklist.includes(item.id)}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
