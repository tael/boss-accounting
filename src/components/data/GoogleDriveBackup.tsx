/**
 * 구글 드라이브 appData 백업/복원 UI 카드
 */

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useTransactionStore } from '@/stores/transactionStore'
import {
  findBackupFileId,
  uploadBackup,
  downloadBackup,
  getBackupMetadata,
} from '@/utils/googleDrive'
import { serializeToJSON, parseFromJSONString } from '@/utils/exportImport'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

function formatDateTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export default function GoogleDriveBackup() {
  const { accessToken, isLoading, error, signIn, signOut, setError } = useAuthStore()
  const { transactions } = useTransactionStore()

  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)

  // 환경변수 미설정 시 안내만 표시
  if (!CLIENT_ID) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">구글 드라이브 백업</h2>
        <p className="text-xs text-gray-500">
          구글 드라이브 연동이 설정되지 않았습니다. 환경 변수{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">VITE_GOOGLE_CLIENT_ID</code>를
          설정해 주세요.
        </p>
      </div>
    )
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // 로그인 후 마지막 백업 시간 조회
  useEffect(() => {
    if (!accessToken) {
      setLastBackupTime(null)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const fileId = await findBackupFileId(accessToken)
        if (cancelled || !fileId) return
        const meta = await getBackupMetadata(accessToken, fileId)
        if (!cancelled && meta) {
          setLastBackupTime(meta.modifiedTime)
        }
      } catch {
        // 조회 실패 시 무시
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessToken])

  // authStore error를 message로 표시
  useEffect(() => {
    if (!error) return
    if (error.startsWith('POPUP_BLOCKED:')) {
      showMessage('error', error.replace('POPUP_BLOCKED:', '').trim())
    } else {
      showMessage('error', error)
    }
    setError(null)
  }, [error, setError])

  const handleSignIn = async () => {
    await signIn()
  }

  const handleSignOut = async () => {
    await signOut()
    setLastBackupTime(null)
  }

  const handleUpload = async () => {
    if (!accessToken) return
    setBackupLoading(true)
    try {
      const json = serializeToJSON(transactions)
      const result = await uploadBackup(accessToken, json)
      setLastBackupTime(result.modifiedTime)
      showMessage('success', `${transactions.length}건의 거래 데이터를 구글 드라이브에 백업했습니다.`)
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : '백업에 실패했습니다.')
    } finally {
      setBackupLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!accessToken) return

    const confirmed = window.confirm(
      '구글 드라이브 백업에서 데이터를 복원하면 현재 거래 데이터가 모두 교체됩니다.\n계속하시겠습니까?',
    )
    if (!confirmed) return

    setRestoreLoading(true)
    try {
      const fileId = await findBackupFileId(accessToken)
      if (!fileId) {
        showMessage('error', '구글 드라이브에 저장된 백업 파일이 없습니다.')
        return
      }

      const jsonContent = await downloadBackup(accessToken, fileId)
      const result = parseFromJSONString(jsonContent)

      if (!result.success) {
        showMessage('error', result.error ?? '백업 데이터를 읽는 데 실패했습니다.')
        return
      }

      useTransactionStore.getState().importTransactions(result.transactions ?? [])
      showMessage('success', `${result.transactionCount}건의 거래 데이터를 복원했습니다.`)
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : '복원에 실패했습니다.')
    } finally {
      setRestoreLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-blue-100 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">구글 드라이브 백업</h2>
      <p className="text-xs text-gray-500">
        구글 드라이브의 앱 전용 숨김 공간에 데이터를 백업합니다. 다른 기기에서도 복원할 수
        있습니다.
      </p>

      {/* 메시지 배너 */}
      {message && (
        <div
          className={[
            'rounded-lg px-3 py-2 text-xs font-medium',
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      {!accessToken ? (
        /* 로그인 전 */
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <span>🔑</span>
          {isLoading ? '로그인 중...' : '구글로 로그인'}
        </button>
      ) : (
        /* 로그인 후 */
        <div className="space-y-3">
          {/* 연결 상태 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-700 font-medium">구글 드라이브 연결됨</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-xs text-gray-400 hover:text-gray-600 underline disabled:opacity-50 transition-colors"
            >
              로그아웃
            </button>
          </div>

          {/* 마지막 백업 시간 */}
          {lastBackupTime && (
            <p className="text-xs text-gray-400">
              마지막 백업: {formatDateTime(lastBackupTime)}
            </p>
          )}

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={backupLoading || restoreLoading || transactions.length === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <span>☁️</span>
              {backupLoading ? '백업 중...' : '드라이브에 백업'}
            </button>

            <button
              type="button"
              onClick={handleRestore}
              disabled={backupLoading || restoreLoading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <span>🔄</span>
              {restoreLoading ? '복원 중...' : '백업에서 복원'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
