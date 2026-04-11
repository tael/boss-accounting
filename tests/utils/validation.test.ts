/**
 * validation.ts 유틸리티 단위 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  validateTransaction,
  isValidDate,
  getFieldError,
  MAX_AMOUNT_KRW,
} from '@/utils/validation'
import type { TransactionInput } from '@/types/transaction'

const validInput: TransactionInput = {
  type: 'income',
  date: '2025-01-15',
  amountKRW: 1_000_000,
  categoryId: 'income-service',
}

describe('isValidDate', () => {
  it('유효한 날짜를 허용한다', () => {
    expect(isValidDate('2025-01-15')).toBe(true)
    expect(isValidDate('2025-12-31')).toBe(true)
    expect(isValidDate('2024-02-29')).toBe(true) // 윤년
  })

  it('잘못된 형식을 거부한다', () => {
    expect(isValidDate('2025/01/15')).toBe(false)
    expect(isValidDate('20250115')).toBe(false)
    expect(isValidDate('25-01-15')).toBe(false)
    expect(isValidDate('')).toBe(false)
  })

  it('존재하지 않는 날짜를 거부한다', () => {
    expect(isValidDate('2025-02-29')).toBe(false) // 2025는 윤년 아님
    expect(isValidDate('2025-13-01')).toBe(false) // 13월 없음
    expect(isValidDate('2025-01-32')).toBe(false) // 32일 없음
  })
})

describe('validateTransaction', () => {
  it('유효한 입력을 통과시킨다', () => {
    const result = validateTransaction(validInput)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('type이 없으면 에러', () => {
    const result = validateTransaction({ ...validInput, type: undefined })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'type')).toBeTruthy()
  })

  it('date가 없으면 에러', () => {
    const result = validateTransaction({ ...validInput, date: undefined })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'date')).toBeTruthy()
  })

  it('잘못된 날짜 형식이면 에러', () => {
    const result = validateTransaction({ ...validInput, date: '2025/01/15' })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'date')).toBeTruthy()
  })

  it('존재하지 않는 날짜면 에러', () => {
    const result = validateTransaction({ ...validInput, date: '2025-02-30' })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'date')).toBeTruthy()
  })

  it('금액이 0 이하면 에러', () => {
    expect(validateTransaction({ ...validInput, amountKRW: 0 }).valid).toBe(false)
    expect(validateTransaction({ ...validInput, amountKRW: -1 }).valid).toBe(false)
  })

  it(`금액이 ${MAX_AMOUNT_KRW.toLocaleString()}원 초과면 에러`, () => {
    const result = validateTransaction({ ...validInput, amountKRW: MAX_AMOUNT_KRW + 1 })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'amountKRW')).toBeTruthy()
  })

  it(`금액이 정확히 ${MAX_AMOUNT_KRW.toLocaleString()}원이면 통과`, () => {
    const result = validateTransaction({ ...validInput, amountKRW: MAX_AMOUNT_KRW })
    expect(result.valid).toBe(true)
  })

  it('소수점 금액은 에러', () => {
    const result = validateTransaction({ ...validInput, amountKRW: 1_000_000.5 })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'amountKRW')).toContain('정수')
  })

  it('categoryId가 없으면 에러', () => {
    const result = validateTransaction({ ...validInput, categoryId: '' })
    expect(result.valid).toBe(false)
    expect(getFieldError(result.errors, 'categoryId')).toBeTruthy()
  })

  it('memo는 선택 필드로 없어도 통과', () => {
    const result = validateTransaction({ ...validInput, memo: undefined })
    expect(result.valid).toBe(true)
  })

  it('여러 에러가 동시에 발생할 수 있다', () => {
    const result = validateTransaction({})
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

describe('getFieldError', () => {
  it('해당 필드의 에러 메시지를 반환한다', () => {
    const { errors } = validateTransaction({ ...validInput, amountKRW: -1 })
    expect(getFieldError(errors, 'amountKRW')).toBeTruthy()
    expect(getFieldError(errors, 'date')).toBeUndefined()
  })
})
