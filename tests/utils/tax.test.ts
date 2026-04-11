/**
 * tax.ts 유틸리티 단위 테스트
 */

import { describe, it, expect } from 'vitest'
import { calculateVAT, calculateIncomeTax, calculateBreakEven } from '@/utils/tax'
import { TAX_RATES_2025 } from '@/constants/taxRates'

describe('calculateVAT', () => {
  it('납부세액 = 매출세액 - 매입세액', () => {
    // 매출 10,000,000원, 매입 3,000,000원
    const result = calculateVAT(10_000_000, 3_000_000)
    expect(result.outputVatKRW).toBe(1_000_000) // 10% of 10M
    expect(result.inputVatKRW).toBe(300_000)    // 10% of 3M
    expect(result.payableVatKRW).toBe(700_000)  // 1M - 300K
  })

  it('매입세액이 매출세액보다 크면 환급 세액(음수)을 반환한다', () => {
    const result = calculateVAT(1_000_000, 5_000_000)
    expect(result.payableVatKRW).toBe(-400_000) // 100K - 500K
  })

  it('매출이 0이면 납부세액은 매입세액의 음수', () => {
    const result = calculateVAT(0, 1_000_000)
    expect(result.outputVatKRW).toBe(0)
    expect(result.payableVatKRW).toBe(-100_000)
  })

  it('세율이 10%로 적용된다', () => {
    const result = calculateVAT(100_000_000, 0, TAX_RATES_2025)
    expect(result.outputVatKRW).toBe(10_000_000)
  })

  it('정수 원 단위 결과를 반환한다', () => {
    const result = calculateVAT(3_333_333, 1_111_111)
    expect(Number.isInteger(result.outputVatKRW)).toBe(true)
    expect(Number.isInteger(result.inputVatKRW)).toBe(true)
    expect(Number.isInteger(result.payableVatKRW)).toBe(true)
  })
})

describe('calculateIncomeTax', () => {
  it('1,400만원 이하: 6% 세율', () => {
    const result = calculateIncomeTax(10_000_000)
    expect(result.calculatedTaxKRW).toBe(600_000) // 10M * 6% - 0
    expect(result.appliedRatePct).toBe(6)
  })

  it('1,400만원 초과 5,000만원 이하: 15% 세율 적용, 누진공제 126만원', () => {
    // 과세표준 30,000,000원: 30M * 15% - 1,260,000 = 3,240,000
    const result = calculateIncomeTax(30_000_000)
    expect(result.calculatedTaxKRW).toBe(3_240_000)
    expect(result.appliedRatePct).toBe(15)
  })

  it('5,000만원 초과 8,800만원 이하: 24% 세율, 누진공제 576만원', () => {
    // 과세표준 60,000,000원: 60M * 24% - 5,760,000 = 8,640,000
    const result = calculateIncomeTax(60_000_000)
    expect(result.calculatedTaxKRW).toBe(8_640_000)
    expect(result.appliedRatePct).toBe(24)
  })

  it('8,800만원 초과 1억5천만원 이하: 35% 세율', () => {
    // 과세표준 100,000,000원: 100M * 35% - 15,440,000 = 19,560,000
    const result = calculateIncomeTax(100_000_000)
    expect(result.calculatedTaxKRW).toBe(19_560_000)
    expect(result.appliedRatePct).toBe(35)
  })

  it('과세표준 0 이하면 세금 0', () => {
    expect(calculateIncomeTax(0).calculatedTaxKRW).toBe(0)
    expect(calculateIncomeTax(-1_000_000).calculatedTaxKRW).toBe(0)
  })

  it('2025년 세율 적용 연도 반환', () => {
    const result = calculateIncomeTax(50_000_000)
    expect(result.taxYear).toBe(2025)
  })

  it('정수 원 단위 결과를 반환한다', () => {
    const result = calculateIncomeTax(33_333_333)
    expect(Number.isInteger(result.calculatedTaxKRW)).toBe(true)
  })

  it('10억원 초과 최고 세율 구간(45%)도 계산된다', () => {
    const result = calculateIncomeTax(2_000_000_000)
    expect(result.appliedRatePct).toBe(45)
    // 2B * 45% - 65,940,000 = 900,000,000 - 65,940,000 = 834,060,000
    expect(result.calculatedTaxKRW).toBe(834_060_000)
  })
})

describe('calculateBreakEven', () => {
  it('BEP를 올바르게 계산한다', () => {
    // 고정비 1,000,000 / (1 - 2,000,000/10,000,000) = 1,000,000 / 0.8 = 1,250,000
    const result = calculateBreakEven(1_000_000, 2_000_000, 10_000_000)
    expect(result).toBe(1_250_000)
  })

  it('매출이 0이면 null을 반환한다', () => {
    expect(calculateBreakEven(1_000_000, 0, 0)).toBeNull()
  })

  it('변동비율이 100% 이상이면 null을 반환한다 (손익분기점 불가능)', () => {
    // 변동비 >= 매출이면 기여마진 <= 0
    expect(calculateBreakEven(1_000_000, 10_000_000, 10_000_000)).toBeNull()
  })

  it('정수 원 단위 결과를 반환한다', () => {
    const result = calculateBreakEven(1_000_000, 3_000_000, 10_000_000)
    expect(result).not.toBeNull()
    expect(Number.isInteger(result!)).toBe(true)
  })
})
