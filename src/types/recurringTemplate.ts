/**
 * 반복 거래 템플릿 타입 정의
 * 매월 반복되는 고정 거래(임차료, 통신비 등)를 템플릿으로 저장하여
 * 해당 날짜에 자동/수동 등록할 수 있도록 한다.
 */

import type { TransactionType } from '@/types/transaction'

export interface RecurringTemplate {
  /** 고유 식별자 (UUID) */
  id: string
  /** 매월 등록할 날짜 (1-28) */
  dayOfMonth: number
  /** 거래 유형: 매출 또는 비용 */
  type: TransactionType
  /** 금액 (정수 원 단위) */
  amountKRW: number
  /** 카테고리 ID */
  categoryId: string
  /** 메모 (선택) */
  memo?: string
  /** 부가세 공제 가능 여부. expense 타입에만 유효, 기본 true */
  isVatDeductible?: boolean
  /** 활성 여부 */
  enabled: boolean
  /** 마지막 자동 등록 월 (YYYY-MM, 중복 방지) */
  lastAppliedMonth?: string
}

/** 템플릿 입력용 타입 (id, lastAppliedMonth 제외) */
export type RecurringTemplateInput = Omit<RecurringTemplate, 'id' | 'lastAppliedMonth'>
