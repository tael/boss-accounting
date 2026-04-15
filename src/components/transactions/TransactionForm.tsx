import { useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { validateTransaction, getFieldError } from '@/utils/validation'
import type { TransactionInput, TransactionType } from '@/types/transaction'
import CategorySelect from './CategorySelect'

interface TransactionFormProps {
  initialData?: Partial<TransactionInput> & { id?: string }
  onSuccess?: () => void
  onCancel?: () => void
}

const today = new Date().toISOString().slice(0, 10)

export default function TransactionForm({
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactionStore()
  const isEdit = Boolean(initialData?.id)

  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'income')
  const [date, setDate] = useState(initialData?.date ?? today)
  const [amountRaw, setAmountRaw] = useState(
    initialData?.amountKRW !== undefined ? String(initialData.amountKRW) : '',
  )
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '')
  const [memo, setMemo] = useState(initialData?.memo ?? '')
  const [isVatDeductible, setIsVatDeductible] = useState(
    initialData?.isVatDeductible !== false, // 기본 true
  )
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleTypeChange = (next: TransactionType) => {
    setType(next)
    setCategoryId('') // 유형 바뀌면 카테고리 초기화
    setIsVatDeductible(true) // 유형 변경 시 부가세 공제 여부 초기화
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = amountRaw === '' ? undefined : Number(amountRaw.replace(/,/g, ''))
    const input: Partial<TransactionInput> = {
      type,
      date,
      amountKRW: amount as number,
      categoryId,
      memo: memo.trim() || undefined,
      isVatDeductible: type === 'expense' ? isVatDeductible : undefined,
    }

    const result = validateTransaction(input)
    if (!result.valid) {
      setErrors(result.errors)
      return
    }

    setSubmitting(true)
    try {
      if (isEdit && initialData?.id) {
        updateTransaction(initialData.id, input as TransactionInput)
      } else {
        addTransaction(input as TransactionInput)
      }
      onSuccess?.()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 거래 유형 토글 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">거래 유형</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={[
              'flex-1 py-2 text-sm font-medium transition-colors',
              type === 'income'
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            매출
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={[
              'flex-1 py-2 text-sm font-medium transition-colors',
              type === 'expense'
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50',
            ].join(' ')}
          >
            비용
          </button>
        </div>
        {getFieldError(errors, 'type') && (
          <p className="mt-1 text-xs text-red-500">{getFieldError(errors, 'type')}</p>
        )}
      </div>

      {/* 날짜 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
            getFieldError(errors, 'date') ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        />
        {getFieldError(errors, 'date') && (
          <p className="mt-1 text-xs text-red-500">{getFieldError(errors, 'date')}</p>
        )}
      </div>

      {/* 금액 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">금액 (원)</label>
        <input
          type="number"
          min={1}
          step={1}
          placeholder="0"
          value={amountRaw}
          onChange={(e) => setAmountRaw(e.target.value)}
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
            getFieldError(errors, 'amountKRW') ? 'border-red-400' : 'border-gray-300',
          ].join(' ')}
        />
        {getFieldError(errors, 'amountKRW') && (
          <p className="mt-1 text-xs text-red-500">{getFieldError(errors, 'amountKRW')}</p>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <CategorySelect
          type={type}
          value={categoryId}
          onChange={setCategoryId}
          error={getFieldError(errors, 'categoryId')}
        />
      </div>

      {/* 메모 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
        <input
          type="text"
          placeholder="거래 메모를 입력하세요"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={200}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 부가세 공제 대상 (비용일 때만 표시) */}
      {type === 'expense' && (
        <div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVatDeductible}
              onChange={(e) => setIsVatDeductible(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">부가세 공제 대상</span>
          </label>
          {!isVatDeductible && (
            <p className="mt-1 text-xs text-amber-600">
              간이영수증 · 인건비 등 적격증빙 미수취 비용은 매입세액 공제 불가
            </p>
          )}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isEdit ? '수정 완료' : '거래 추가'}
        </button>
      </div>
    </form>
  )
}
