/**
 * 반복 거래 템플릿 목록 + 추가 폼
 * - 매월 반복되는 고정 거래(임차료, 통신비 등)를 템플릿으로 관리
 * - 활성/비활성 토글, 삭제 제공
 * - 새 템플릿 추가 폼 (날짜, 유형, 금액, 카테고리, 메모)
 */

import { useState } from 'react'
import { useRecurringStore } from '@/stores/recurringStore'
import { getCategoryName } from '@/constants/categories'
import { formatKRW, parseKRW, formatKRWNoSymbol } from '@/utils/format'
import CategorySelect from '@/components/transactions/CategorySelect'
import type {
  RecurringTemplate,
  RecurringTemplateInput,
} from '@/types/recurringTemplate'
import type { TransactionType } from '@/types/transaction'

/** dayOfMonth 허용 범위 (윤달/30·31일 회피) */
const MIN_DAY = 1
const MAX_DAY = 28

interface FormErrors {
  dayOfMonth?: string
  amountKRW?: string
  categoryId?: string
}

function validateInput(input: Partial<RecurringTemplateInput>): FormErrors {
  const errors: FormErrors = {}
  if (
    input.dayOfMonth === undefined ||
    !Number.isInteger(input.dayOfMonth) ||
    input.dayOfMonth < MIN_DAY ||
    input.dayOfMonth > MAX_DAY
  ) {
    errors.dayOfMonth = `1-${MAX_DAY} 사이의 날짜를 입력하세요`
  }
  if (
    input.amountKRW === undefined ||
    !Number.isFinite(input.amountKRW) ||
    input.amountKRW <= 0
  ) {
    errors.amountKRW = '0보다 큰 금액을 입력하세요'
  }
  if (!input.categoryId) {
    errors.categoryId = '카테고리를 선택하세요'
  }
  return errors
}

export default function RecurringList() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useRecurringStore()

  const [showForm, setShowForm] = useState(false)
  const [dayOfMonth, setDayOfMonth] = useState<number>(1)
  const [type, setType] = useState<TransactionType>('expense')
  const [amountRaw, setAmountRaw] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [memo, setMemo] = useState('')
  const [isVatDeductible, setIsVatDeductible] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const resetForm = () => {
    setDayOfMonth(1)
    setType('expense')
    setAmountRaw('')
    setCategoryId('')
    setMemo('')
    setIsVatDeductible(true)
    setErrors({})
  }

  const handleTypeChange = (next: TransactionType) => {
    setType(next)
    setCategoryId('')
    setIsVatDeductible(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = amountRaw === '' ? undefined : Number(amountRaw)
    const input: RecurringTemplateInput = {
      dayOfMonth,
      type,
      amountKRW: amount as number,
      categoryId,
      memo: memo.trim() || undefined,
      isVatDeductible: type === 'expense' ? isVatDeductible : undefined,
      enabled: true,
    }

    const validationErrors = validateInput(input)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    addTemplate(input)
    resetForm()
    setShowForm(false)
  }

  const handleToggleEnabled = (tpl: RecurringTemplate) => {
    updateTemplate(tpl.id, { enabled: !tpl.enabled })
  }

  const handleDelete = (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      return
    }
    deleteTemplate(id)
    setConfirmDeleteId(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">반복 거래</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            매월 같은 날 반복되는 고정 거래를 템플릿으로 저장해 빠르게 등록합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm()
            setShowForm((v) => !v)
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          {showForm ? '취소' : '템플릿 추가'}
        </button>
      </div>

      {/* 추가 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3"
        >
          {/* 거래 유형 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              거래 유형
            </label>
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                aria-pressed={type === 'income'}
                className={[
                  'flex-1 py-1.5 text-sm font-medium transition-colors',
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
                aria-pressed={type === 'expense'}
                className={[
                  'flex-1 py-1.5 text-sm font-medium transition-colors',
                  type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                비용
              </button>
            </div>
          </div>

          {/* 날짜 + 금액 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                매월 등록일 (1-28)
              </label>
              <input
                type="number"
                min={MIN_DAY}
                max={MAX_DAY}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.dayOfMonth ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {errors.dayOfMonth && (
                <p className="mt-1 text-xs text-red-500">{errors.dayOfMonth}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                금액 (원)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={
                  amountRaw === '' ? '' : formatKRWNoSymbol(Number(amountRaw) || 0)
                }
                onChange={(e) => {
                  const raw = parseKRW(e.target.value)
                  setAmountRaw(Number.isNaN(raw) ? '' : String(raw))
                }}
                className={[
                  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors.amountKRW ? 'border-red-400' : 'border-gray-300',
                ].join(' ')}
              />
              {errors.amountKRW && (
                <p className="mt-1 text-xs text-red-500">{errors.amountKRW}</p>
              )}
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <CategorySelect
              type={type}
              value={categoryId}
              onChange={setCategoryId}
              error={errors.categoryId}
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              메모 (선택)
            </label>
            <input
              type="text"
              placeholder="예: 사무실 임차료"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 부가세 공제 (비용일 때만) */}
          {type === 'expense' && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isVatDeductible}
                onChange={(e) => setIsVatDeductible(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">부가세 공제 대상</span>
            </label>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              템플릿 저장
            </button>
          </div>
        </form>
      )}

      {/* 목록 */}
      {templates.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          등록된 반복 거래 템플릿이 없습니다.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 shrink-0">
                  <span className="text-[10px] text-gray-500">매월</span>
                  <span className="text-sm font-bold text-gray-800">
                    {tpl.dayOfMonth}일
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={[
                        'text-[10px] font-medium px-1.5 py-0.5 rounded',
                        tpl.type === 'income'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600',
                      ].join(' ')}
                    >
                      {tpl.type === 'income' ? '매출' : '비용'}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {getCategoryName(tpl.categoryId)}
                    </span>
                  </div>
                  {tpl.memo && (
                    <p className="text-xs text-gray-500 truncate">{tpl.memo}</p>
                  )}
                  {tpl.lastAppliedMonth && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      마지막 적용: {tpl.lastAppliedMonth}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={[
                    'text-sm font-semibold',
                    tpl.type === 'income' ? 'text-emerald-600' : 'text-red-500',
                  ].join(' ')}
                >
                  {tpl.type === 'income' ? '+' : '-'}
                  {formatKRW(tpl.amountKRW)}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(tpl)}
                  aria-pressed={tpl.enabled}
                  title={tpl.enabled ? '활성 (클릭시 비활성화)' : '비활성 (클릭시 활성화)'}
                  className={[
                    'text-xs px-2 py-1 rounded-md border transition-colors',
                    tpl.enabled
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100',
                  ].join(' ')}
                >
                  {tpl.enabled ? '활성' : '비활성'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl.id)}
                  onBlur={() => setConfirmDeleteId(null)}
                  className={[
                    'text-xs px-2 py-1 rounded-md border transition-colors',
                    confirmDeleteId === tpl.id
                      ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                      : 'border-red-200 text-red-500 hover:bg-red-50',
                  ].join(' ')}
                >
                  {confirmDeleteId === tpl.id ? '한 번 더' : '삭제'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
