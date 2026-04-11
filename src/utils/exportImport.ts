/**
 * JSON export/import 유틸리티
 * 전체 store 데이터 백업 및 복원
 * localStorage 유실 시 유일한 복구 수단
 */

import type { Transaction } from '@/types/transaction'

/** 내보내기 데이터 구조 */
export interface ExportData {
  /** 내보내기 버전 (스키마 마이그레이션용) */
  version: number
  /** 내보낸 시각 (ISO 8601) */
  exportedAt: string
  /** 앱 식별자 */
  appId: 'boss-accounting'
  /** 거래 데이터 */
  transactions: Transaction[]
  /** 사용자 설정 (선택) */
  settings?: Record<string, unknown>
}

/** 현재 내보내기 버전 */
export const EXPORT_VERSION = 1

/**
 * 데이터를 JSON 문자열로 직렬화 (드라이브 업로드 등에 활용)
 */
export function serializeToJSON(
  transactions: Transaction[],
  settings?: Record<string, unknown>,
): string {
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appId: 'boss-accounting',
    transactions,
    settings,
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 데이터를 JSON 파일로 내보내기
 * 브라우저 다운로드 트리거
 */
export function exportToJSON(
  transactions: Transaction[],
  settings?: Record<string, unknown>,
): void {
  const json = serializeToJSON(transactions, settings)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const today = new Date().toISOString().slice(0, 10)
  const filename = `boss-accounting-backup-${today}.json`

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()

  // 메모리 누수 방지
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** import 결과 */
export interface ImportResult {
  success: boolean
  transactions?: Transaction[]
  settings?: Record<string, unknown>
  error?: string
  transactionCount?: number
}

/**
 * JSON 문자열에서 데이터 파싱 (드라이브 복원 등에 활용)
 */
export function parseFromJSONString(jsonString: string): ImportResult {
  try {
    const data: unknown = JSON.parse(jsonString)
    return _parseExportData(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'JSON 파싱 오류: 데이터가 손상되었을 수 있습니다.' }
    }
    return {
      success: false,
      error: `데이터를 읽는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * JSON 파일에서 데이터 가져오기
 * @param file 업로드된 파일 객체
 */
export async function importFromJSON(file: File): Promise<ImportResult> {
  try {
    const text = await file.text()
    const data: unknown = JSON.parse(text)
    return _parseExportData(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'JSON 파싱 오류: 파일이 손상되었을 수 있습니다.' }
    }
    return {
      success: false,
      error: `파일을 읽는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/** 파싱된 객체에서 ImportResult 추출 (내부 공유 함수) */
function _parseExportData(data: unknown): ImportResult {
  if (!isExportData(data)) {
    return {
      success: false,
      error: '올바른 형식의 백업 파일이 아닙니다.',
    }
  }

  if (data.appId !== 'boss-accounting') {
    return {
      success: false,
      error: '다른 앱의 백업 파일입니다.',
    }
  }

  // 버전별 마이그레이션 (향후 확장)
  if (data.version > EXPORT_VERSION) {
    return {
      success: false,
      error: `지원하지 않는 백업 버전입니다. (버전 ${data.version})`,
    }
  }

  // 거래 데이터 검증
  const transactions = validateTransactions(data.transactions)

  return {
    success: true,
    transactions,
    settings: data.settings,
    transactionCount: transactions.length,
  }
}

/** 내보내기 데이터 타입 가드 */
function isExportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj['version'] === 'number' &&
    typeof obj['exportedAt'] === 'string' &&
    typeof obj['appId'] === 'string' &&
    Array.isArray(obj['transactions'])
  )
}

/** 거래 데이터 기본 검증 (손상된 항목 제거) */
function validateTransactions(raw: unknown[]): Transaction[] {
  return raw.filter((item): item is Transaction => {
    if (typeof item !== 'object' || item === null) return false
    const tx = item as Record<string, unknown>
    return (
      typeof tx['id'] === 'string' &&
      (tx['type'] === 'income' || tx['type'] === 'expense') &&
      typeof tx['date'] === 'string' &&
      typeof tx['amountKRW'] === 'number' &&
      Number.isInteger(tx['amountKRW']) &&
      tx['amountKRW'] > 0 &&
      typeof tx['categoryId'] === 'string'
    )
  })
}
