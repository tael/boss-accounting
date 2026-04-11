import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/categories'
import type { TransactionType } from '@/types/transaction'

interface CategorySelectProps {
  type: TransactionType
  value: string
  onChange: (categoryId: string) => void
  error?: string
  disabled?: boolean
}

export default function CategorySelect({
  type,
  value,
  onChange,
  error,
  disabled = false,
}: CategorySelectProps) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          error ? 'border-red-400' : 'border-gray-300',
        ].join(' ')}
      >
        <option value="">카테고리 선택</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
