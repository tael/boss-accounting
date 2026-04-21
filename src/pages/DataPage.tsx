import { useRef, useState } from 'react'
import { useTransactionStore } from '@/stores/transactionStore'
import { exportToJSON, importFromJSON } from '@/utils/exportImport'
import { buildSampleTransactions } from '@/utils/sampleData'
import GoogleDriveBackup from '@/components/data/GoogleDriveBackup'

function getLocalStorageUsageKB(): number {
  try {
    let total = 0
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key)
      if (value) total += key.length + value.length
    }
    return Math.round((total * 2) / 1024) // UTF-16 기준 bytes → KB
  } catch {
    return 0
  }
}

export default function DataPage() {
  const { transactions, clearAll, importTransactions, bulkAddTransactions } = useTransactionStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const usageKB = getLocalStorageUsageKB()

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleExport = () => {
    if (transactions.length === 0) {
      showMessage('error', '내보낼 거래 데이터가 없습니다.')
      return
    }
    exportToJSON(transactions)
    showMessage('success', `${transactions.length}건의 거래를 JSON 파일로 내보냈습니다.`)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 input 초기화 (같은 파일 재선택 허용)
    e.target.value = ''

    const confirmed = window.confirm(
      `"${file.name}" 파일을 가져오면 현재 거래 데이터가 모두 교체됩니다.\n계속하시겠습니까?`,
    )
    if (!confirmed) return

    setImporting(true)
    try {
      const result = await importFromJSON(file)
      if (!result.success) {
        showMessage('error', result.error ?? '가져오기에 실패했습니다.')
        return
      }

      importTransactions(result.transactions ?? [])
      showMessage('success', `${result.transactionCount}건의 거래를 성공적으로 가져왔습니다.`)
    } finally {
      setImporting(false)
    }
  }

  const handleLoadSample = () => {
    const confirmed = window.confirm(
      '예시 데이터 38건을 추가합니다. 기존 데이터는 유지됩니다.\n계속하시겠습니까?',
    )
    if (!confirmed) return

    const samples = buildSampleTransactions()
    bulkAddTransactions(samples)
    showMessage('success', `예시 데이터 ${samples.length}건을 추가했습니다.`)
  }

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    clearAll()
    setConfirmClear(false)
    showMessage('success', '모든 거래 데이터가 삭제되었습니다.')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">데이터 관리</h1>

      {/* 메시지 배너 */}
      {message && (
        <div
          className={[
            'rounded-lg px-4 py-3 text-sm font-medium',
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      {/* 현황 카드 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">현재 저장 현황</h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">저장된 거래 건수</span>
            <span className="font-bold text-gray-900">{transactions.length}건</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">localStorage 사용량 (대략)</span>
            <span className="font-medium text-gray-700">{usageKB} KB</span>
          </div>
        </div>
      </div>

      {/* 예시 데이터 생성 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">예시 데이터 생성</h2>
        <p className="text-xs text-gray-500">
          소규모 서비스업 기준 약 3개월치 거래 38건을 추가합니다. 앱 기능을 빠르게 체험하거나
          테스트할 때 사용하세요. 기존 데이터는 삭제되지 않습니다.
        </p>
        <button
          type="button"
          onClick={handleLoadSample}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <span>✨</span>
          예시 데이터 생성
        </button>
      </div>

      {/* JSON 내보내기 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">JSON 내보내기</h2>
        <p className="text-xs text-gray-500">
          현재 저장된 모든 거래 데이터를 JSON 파일로 다운로드합니다. 정기적으로 백업해두는 것을
          권장합니다.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <span>⬇️</span>
          JSON 파일로 내보내기
        </button>
      </div>

      {/* JSON 가져오기 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">JSON 가져오기</h2>
        <p className="text-xs text-gray-500">
          이전에 내보낸 JSON 백업 파일을 불러옵니다. 현재 데이터는 모두 교체되니 주의하세요.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleImportClick}
          disabled={importing}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <span>⬆️</span>
          {importing ? '가져오는 중...' : 'JSON 파일에서 가져오기'}
        </button>
      </div>

      {/* 데이터 초기화 */}
      <div className="bg-white rounded-xl border border-red-100 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-red-700">데이터 초기화</h2>
        <p className="text-xs text-gray-500">
          저장된 모든 거래 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다. 삭제 전에 JSON
          내보내기로 백업을 권장합니다.
        </p>
        <button
          type="button"
          onClick={handleClearAll}
          onBlur={() => setConfirmClear(false)}
          className={[
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            confirmClear
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'border border-red-300 text-red-600 hover:bg-red-50',
          ].join(' ')}
        >
          <span>🗑️</span>
          {confirmClear ? '정말 삭제합니다 (한 번 더 클릭)' : '모든 데이터 삭제'}
        </button>
      </div>

      {/* 구글 드라이브 백업 */}
      <GoogleDriveBackup />
    </div>
  )
}
