/**
 * 거래 입력 검증 유틸리티
 */

import type { TransactionInput } from '@/types/transaction'

/** 검증 에러 타입 */
export interface ValidationError {
  field: string
  message: string
}

/** 검증 결과 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/** 금액 한도 (10억 원) */
export const MAX_AMOUNT_KRW = 1_000_000_000

/**
 * 날짜 문자열(YYYY-MM-DD)이 유효한지 검사
 */
export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return false
  // Date 객체가 입력 날짜를 그대로 반영하는지 확인 (예: 2025-02-30 방어)
  const [year, month, day] = dateStr.split('-').map(Number)
  return (
    d.getFullYear() === year &&
    d.getMonth() + 1 === month &&
    d.getDate() === day
  )
}

/**
 * 거래 입력 데이터를 검증
 */
export function validateTransaction(input: Partial<TransactionInput>): ValidationResult {
  const errors: ValidationError[] = []

  // 거래 유형
  if (!input.type) {
    errors.push({ field: 'type', message: '거래 유형을 선택해주세요.' })
  } else if (input.type !== 'income' && input.type !== 'expense') {
    errors.push({ field: 'type', message: '거래 유형은 income 또는 expense여야 합니다.' })
  }

  // 날짜
  if (!input.date) {
    errors.push({ field: 'date', message: '날짜를 입력해주세요.' })
  } else if (!isValidDate(input.date)) {
    errors.push({ field: 'date', message: '유효하지 않은 날짜입니다. (YYYY-MM-DD 형식)' })
  }

  // 금액
  if (input.amountKRW === undefined || input.amountKRW === null) {
    errors.push({ field: 'amountKRW', message: '금액을 입력해주세요.' })
  } else {
    if (!Number.isFinite(input.amountKRW)) {
      errors.push({ field: 'amountKRW', message: '유효한 금액을 입력해주세요.' })
    } else if (!Number.isInteger(input.amountKRW)) {
      errors.push({ field: 'amountKRW', message: '금액은 원 단위 정수여야 합니다. (소수점 금지)' })
    } else if (input.amountKRW <= 0) {
      errors.push({ field: 'amountKRW', message: '금액은 0원보다 커야 합니다.' })
    } else if (input.amountKRW > MAX_AMOUNT_KRW) {
      errors.push({
        field: 'amountKRW',
        message: `금액은 ${MAX_AMOUNT_KRW.toLocaleString('ko-KR')}원 이하여야 합니다.`,
      })
    }
  }

  // 카테고리
  if (!input.categoryId) {
    errors.push({ field: 'categoryId', message: '카테고리를 선택해주세요.' })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 특정 필드의 에러 메시지 추출
 */
export function getFieldError(
  errors: ValidationError[],
  field: string,
): string | undefined {
  return errors.find((e) => e.field === field)?.message
}
