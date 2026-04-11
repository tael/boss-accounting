/**
 * 세금 계산 유틸리티
 * 모든 금액은 정수 원(KRW) 단위로 처리
 */

import { CURRENT_TAX_RATES } from '@/constants/taxRates'
import type { TaxRates } from '@/constants/taxRates'

export interface VATResult {
  /** 매출세액 (원) */
  outputVatKRW: number
  /** 매입세액 (원) */
  inputVatKRW: number
  /** 납부(환급) 세액 (원). 양수: 납부, 음수: 환급 */
  payableVatKRW: number
}

export interface IncomeTaxResult {
  /** 과세표준 (원) */
  taxableIncomeKRW: number
  /** 산출세액 (원) */
  calculatedTaxKRW: number
  /** 적용 세율 (%) */
  appliedRatePct: number
  /** 적용 연도 */
  taxYear: number
}

/**
 * 부가가치세 계산
 * 납부세액 = 매출세액 - 매입세액
 *
 * @param revenueKRW 과세 매출액 (원, VAT 제외)
 * @param deductibleExpenseKRW 매입세액 공제 가능한 비용 (원, VAT 제외)
 * @param rates 적용 세율 (기본값: 현재 세율)
 */
export function calculateVAT(
  revenueKRW: number,
  deductibleExpenseKRW: number,
  rates: TaxRates = CURRENT_TAX_RATES,
): VATResult {
  const outputVatKRW = Math.round(revenueKRW * rates.vatRate)
  const inputVatKRW = Math.round(deductibleExpenseKRW * rates.vatRate)
  const payableVatKRW = outputVatKRW - inputVatKRW

  return {
    outputVatKRW,
    inputVatKRW,
    payableVatKRW,
  }
}

/**
 * 종합소득세 간이 계산 (2025년 누진세율 적용)
 * 산출세액 = 과세표준 × 세율 - 누진공제
 *
 * @param taxableIncomeKRW 과세표준 (원). 소득공제 후 금액
 * @param rates 적용 세율 (기본값: 현재 세율)
 */
export function calculateIncomeTax(
  taxableIncomeKRW: number,
  rates: TaxRates = CURRENT_TAX_RATES,
): IncomeTaxResult {
  if (taxableIncomeKRW <= 0) {
    return {
      taxableIncomeKRW: 0,
      calculatedTaxKRW: 0,
      appliedRatePct: 0,
      taxYear: rates.year,
    }
  }

  // 해당하는 구간 찾기
  const bracket = rates.incomeTaxBrackets.find(
    (b) =>
      taxableIncomeKRW >= b.minKRW &&
      (b.maxKRW === null || taxableIncomeKRW < b.maxKRW),
  )

  if (!bracket) {
    // 최고 구간 적용 (방어 코드)
    const lastBracket = rates.incomeTaxBrackets[rates.incomeTaxBrackets.length - 1]
    if (!lastBracket) {
      return {
        taxableIncomeKRW,
        calculatedTaxKRW: 0,
        appliedRatePct: 0,
        taxYear: rates.year,
      }
    }
    const calculatedTax = Math.round(
      taxableIncomeKRW * lastBracket.rate - lastBracket.deductionKRW,
    )
    return {
      taxableIncomeKRW,
      calculatedTaxKRW: Math.max(0, calculatedTax),
      appliedRatePct: lastBracket.rate * 100,
      taxYear: rates.year,
    }
  }

  const calculatedTax = Math.round(
    taxableIncomeKRW * bracket.rate - bracket.deductionKRW,
  )

  return {
    taxableIncomeKRW,
    calculatedTaxKRW: Math.max(0, calculatedTax),
    appliedRatePct: bracket.rate * 100,
    taxYear: rates.year,
  }
}

/**
 * 손익분기점(BEP) 계산
 * BEP = 고정비 ÷ (1 - 변동비율)
 * 변동비율 = 변동비 ÷ 매출
 *
 * @param fixedCostKRW 고정비 (원)
 * @param variableCostKRW 변동비 (원)
 * @param revenueKRW 현재 매출 (원, 변동비율 산출용)
 * @returns 손익분기점 매출액 (원). 계산 불가 시 null
 */
export function calculateBreakEven(
  fixedCostKRW: number,
  variableCostKRW: number,
  revenueKRW: number,
): number | null {
  if (revenueKRW <= 0) return null

  const variableCostRatio = variableCostKRW / revenueKRW
  const contributionMarginRatio = 1 - variableCostRatio

  if (contributionMarginRatio <= 0) return null

  return Math.round(fixedCostKRW / contributionMarginRatio)
}
