/**
 * 거래 타입 정의
 * 금액은 항상 정수 원(KRW) 단위로 저장 (소수점 금지)
 */

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  /** 고유 식별자 (UUID) */
  id: string
  /** 거래 유형: 매출 또는 비용 */
  type: TransactionType
  /** 거래 날짜 (ISO 8601 형식: YYYY-MM-DD) */
  date: string
  /** 금액 (정수 원 단위, 소수점 금지) */
  amountKRW: number
  /** 카테고리 ID */
  categoryId: string
  /** 메모 (선택) */
  memo?: string
  /** 생성 시각 (ISO 8601) */
  createdAt: string
  /** 수정 시각 (ISO 8601) */
  updatedAt: string
}

/** 거래 입력용 타입 (id, createdAt, updatedAt 제외) */
export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>

/** 거래 수정용 타입 (일부 필드만 변경 가능) */
export type TransactionUpdate = Partial<TransactionInput>

/** 거래 목록 필터 조건 */
export interface TransactionFilter {
  type?: TransactionType
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
  memoSearch?: string
}
