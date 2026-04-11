import { ALL_CATEGORIES } from '@/constants/categories'
import type { TransactionFilter as FilterState } from '@/types/transaction'

interface TransactionFilterProps {
  filter: FilterState
  onChange: (filter: FilterState) => void
}

export default function TransactionFilter({ filter, onChange }: TransactionFilterProps) {
  const update = (partial: Partial<FilterState>) => onChange({ ...filter, ...partial })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">필터</h3>

      {/* 거래 유형 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">거래 유형</label>
        <div className="flex gap-2">
          {(['', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ type: t || undefined })}
              className={[
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                filter.type === (t || undefined)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
              ].join(' ')}
            >
              {t === '' ? '전체' : t === 'income' ? '매출' : '비용'}
            </button>
          ))}
        </div>
      </div>

      {/* 기간 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">시작일</label>
          <input
            type="date"
            value={filter.dateFrom ?? ''}
            onChange={(e) => update({ dateFrom: e.target.value || undefined })}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">종료일</label>
          <input
            type="date"
            value={filter.dateTo ?? ''}
            onChange={(e) => update({ dateTo: e.target.value || undefined })}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">카테고리</label>
        <select
          value={filter.categoryId ?? ''}
          onChange={(e) => update({ categoryId: e.target.value || undefined })}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">전체 카테고리</option>
          <optgroup label="매출">
            {ALL_CATEGORIES.filter((c) => c.type === 'income').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
          <optgroup label="비용">
            {ALL_CATEGORIES.filter((c) => c.type === 'expense').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* 금액 범위 */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">최소 금액 (원)</label>
          <input
            type="number"
            min={0}
            placeholder="0"
            value={filter.amountMin ?? ''}
            onChange={(e) => update({ amountMin: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">최대 금액 (원)</label>
          <input
            type="number"
            min={0}
            placeholder="제한 없음"
            value={filter.amountMax ?? ''}
            onChange={(e) => update({ amountMax: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 메모 검색 */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">메모 검색</label>
        <input
          type="text"
          placeholder="메모 내용 검색..."
          value={filter.memoSearch ?? ''}
          onChange={(e) => update({ memoSearch: e.target.value || undefined })}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 필터 초기화 */}
      <button
        type="button"
        onClick={() => onChange({})}
        className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        필터 초기화
      </button>
    </div>
  )
}
