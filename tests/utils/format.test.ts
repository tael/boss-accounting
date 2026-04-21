/**
 * format.ts 유틸리티 단위 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  formatKRW,
  parseKRW,
  getTodayLocal,
  formatChangeRate,
} from '@/utils/format'

describe('formatKRW', () => {
  it('양수 금액을 ₩기호와 천단위 구분으로 변환한다', () => {
    expect(formatKRW(1_234_567)).toBe('₩1,234,567')
  })

  it('0을 ₩0으로 변환한다', () => {
    expect(formatKRW(0)).toBe('₩0')
  })

  it('음수 금액도 올바르게 변환한다', () => {
    expect(formatKRW(-500_000)).toBe('₩-500,000')
  })

  it('소수점 입력은 반올림 처리된다', () => {
    expect(formatKRW(1_000.6)).toBe('₩1,001')
    expect(formatKRW(1_000.4)).toBe('₩1,000')
  })

  it('1000 미만 금액도 변환한다', () => {
    expect(formatKRW(500)).toBe('₩500')
  })
})

describe('parseKRW', () => {
  it('₩기호가 포함된 문자열을 파싱한다', () => {
    expect(parseKRW('₩1,234,567')).toBe(1_234_567)
  })

  it('쉼표만 포함된 문자열을 파싱한다', () => {
    expect(parseKRW('1,234,567')).toBe(1_234_567)
  })

  it('공백이 포함된 문자열을 파싱한다', () => {
    expect(parseKRW('  1 234 567  ')).toBe(1_234_567)
  })

  it('빈 문자열은 0을 반환한다', () => {
    // 빈 문자열은 기호/쉼표 제거 후 Number('') = 0이 되므로 0 반환
    expect(parseKRW('')).toBe(0)
  })

  it('비숫자 문자열은 NaN을 반환한다', () => {
    expect(parseKRW('abc')).toBeNaN()
  })

  it('소수점 값은 반올림 처리된다', () => {
    expect(parseKRW('1000.7')).toBe(1001)
    expect(parseKRW('1000.3')).toBe(1000)
  })

  it('0을 파싱한다', () => {
    expect(parseKRW('0')).toBe(0)
  })

  it('음수 값을 파싱한다', () => {
    expect(parseKRW('-500000')).toBe(-500_000)
  })
})

describe('getTodayLocal', () => {
  it('YYYY-MM-DD 형식으로 반환한다', () => {
    const result = getTodayLocal()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('유효한 날짜 문자열이다', () => {
    const result = getTodayLocal()
    const parsed = new Date(result)
    expect(parsed.toString()).not.toBe('Invalid Date')
  })

  it('오늘 날짜를 반환한다', () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const expected = `${year}-${month}-${day}`
    expect(getTodayLocal()).toBe(expected)
  })
})

describe('formatChangeRate', () => {
  it('양수 변화율에 + 부호를 붙인다', () => {
    expect(formatChangeRate(12.5)).toBe('+12.5%')
  })

  it('음수 변화율에 - 부호를 붙인다', () => {
    expect(formatChangeRate(-5.3)).toBe('-5.3%')
  })

  it('0은 + 부호와 함께 반환한다', () => {
    expect(formatChangeRate(0)).toBe('+0.0%')
  })

  it('소수점 1자리로 표시된다', () => {
    expect(formatChangeRate(100)).toBe('+100.0%')
    expect(formatChangeRate(-100)).toBe('-100.0%')
  })

  it('소수점 이하는 toFixed(1) 처리된다', () => {
    // JS 부동소수점: 12.45.toFixed(1) === '12.4' (IEEE 754 특성)
    expect(formatChangeRate(12.45)).toBe('+12.4%')
    expect(formatChangeRate(12.44)).toBe('+12.4%')
    expect(formatChangeRate(12.55)).toBe('+12.6%')
  })
})
