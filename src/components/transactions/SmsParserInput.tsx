import { useState } from 'react'
import { parseSmsText } from '@/utils/smsParser'
import { useTransactionStore } from '@/stores/transactionStore'
import type { ParsedTransaction } from '@/utils/smsParser'
import type { TransactionInput } from '@/types/transaction'

interface SmsParserInputProps {
  onSuccess?: () => void
}

export default function SmsParserInput({ onSuccess }: SmsParserInputProps) {
  const { addTransaction } = useTransactionStore()
  const [smsText, setSmsText] = useState('')
  const [parsed, setParsed] = useState<ParsedTransaction | null>(null)
  const [failed, setFailed] = useState(false)
  const [added, setAdded] = useState(false)

  const handleParse = () => {
    setAdded(false)
    const result = parseSmsText(smsText)
    if (result) {
      setParsed(result)
      setFailed(false)
    } else {
      setParsed(null)
      setFailed(true)
    }
  }

  const handleAdd = () => {
    if (!parsed) return
    const input: TransactionInput = {
      type: parsed.type,
      date: parsed.date,
      amountKRW: parsed.amountKRW,
      categoryId: '',
      memo: parsed.memo,
      isVatDeductible: parsed.type === 'expense' ? true : undefined,
    }
    addTransaction(input)
    setAdded(true)
    setParsed(null)
    setSmsText('')
    setFailed(false)
    onSuccess?.()
  }

  const handleReset = () => {
    setSmsText('')
    setParsed(null)
    setFailed(false)
    setAdded(false)
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          알림 문자 붙여넣기
        </label>
        <textarea
          value={smsText}
          onChange={(e) => {
            setSmsText(e.target.value)
            setParsed(null)
            setFailed(false)
            setAdded(false)
          }}
          placeholder={'예: [국민카드] 1,500원 승인 (스타벅스) 2026-04-22'}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleParse}
          disabled={!smsText.trim()}
          className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          자동 추출
        </button>
        {(parsed || failed || smsText) && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {failed && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700">
          인식 불가: 금액(원)이 포함된 카드/은행 알림 문자를 붙여넣어 주세요.
        </div>
      )}

      {added && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          거래가 추가되었습니다.
        </div>
      )}

      {parsed && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-700 mb-1">추출 결과 미리보기</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-gray-500">날짜</span>
            <span className="font-medium text-gray-800">{parsed.date}</span>

            <span className="text-gray-500">금액</span>
            <span className="font-medium text-gray-800">
              ₩{parsed.amountKRW.toLocaleString('ko-KR')}
            </span>

            <span className="text-gray-500">메모</span>
            <span className="font-medium text-gray-800 truncate">{parsed.memo}</span>

            <span className="text-gray-500">유형</span>
            <span
              className={[
                'font-medium',
                parsed.type === 'income' ? 'text-emerald-600' : 'text-red-500',
              ].join(' ')}
            >
              {parsed.type === 'income' ? '매출' : '비용'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full mt-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            이 거래 추가
          </button>
        </div>
      )}
    </div>
  )
}
