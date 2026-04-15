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

export interface TaxDeductions {
  /** 부양가족 수 (본인 포함, 기본 1명) */
  dependents: number
  /** 국민연금 납입액 (원, 연간) */
  nationalPension: number
  /** 노란우산공제 납입액 (원, 연간, 최대 5_000_000) */
  yellowUmbrella: number
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
  /** (별칭) 과세표준 */
  taxBase: number
  /** (별칭) 산출세액 */
  tax: number
  /** (별칭) 적용 세율 */
  effectiveRate: number
  /** 공제 전 산출세액 (원). 소득공제 미적용 기준 */
  taxBeforeDeductionKRW: number
}

/** 간이과세 업종별 부가가치율 (업종코드 → 비율) */
export const SIMPLIFIED_VAT_RATES: Record<string, number> = {
  retail: 0.15,       // 소매업 (기본)
  restaurant: 0.10,   // 음식점업
  manufacturing: 0.20, // 제조업
  construction: 0.30, // 건설업
  service: 0.30,      // 서비스업 (일반)
  realestate: 0.40,   // 부동산임대업
}

/** 간이과세 업종 레이블 */
export const SIMPLIFIED_VAT_RATE_LABELS: Record<string, string> = {
  retail: '소매업 (15%)',
  restaurant: '음식점업 (10%)',
  manufacturing: '제조업 (20%)',
  construction: '건설업 (30%)',
  service: '서비스업 (30%)',
  realestate: '부동산임대업 (40%)',
}

/** 객체 형식 VAT 입력 */
export interface VATInput {
  /** 과세 매출액 (원, VAT 제외) */
  revenue: number
  /** 적격증빙 매입 비용 (원, VAT 제외, 공제 가능 금액만) */
  deductibleExpenses: number
  /** 과세 유형: 기본 'general' */
  taxType?: 'general' | 'simplified'
  /** 간이과세 업종 코드 (taxType=simplified 일 때 사용, 기본 'retail') */
  simplifiedIndustry?: string
}

/** VAT 계산 결과 (확장) */
export interface VATResultExtended extends VATResult {
  /** 간이과세 적용 업종별 부가가치율 (간이과세자만, 0-1 범위) */
  simplifiedRate?: number
}

/**
 * 부가가치세 계산 (오버로드)
 *
 * 호출 형식 1 (하위 호환): calculateVAT(revenueKRW, deductibleExpenseKRW, rates?)
 * 호출 형식 2 (객체 형식): calculateVAT(input: VATInput, rates?)
 *
 * 일반과세자: 납부세액 = 매출세액 - 매입세액
 * 간이과세자: 납부세액 = 매출액 × 업종별 부가가치율 × 10%
 */
export function calculateVAT(
  revenueOrInput: number | VATInput,
  deductibleExpenseOrRates?: number | TaxRates,
  rates: TaxRates = CURRENT_TAX_RATES,
): VATResultExtended {
  // 객체 형식 호출 처리
  if (typeof revenueOrInput === 'object') {
    const input = revenueOrInput
    const appliedRates =
      deductibleExpenseOrRates !== undefined && typeof deductibleExpenseOrRates === 'object'
        ? deductibleExpenseOrRates
        : CURRENT_TAX_RATES

    if (input.taxType === 'simplified') {
      const industryKey = input.simplifiedIndustry ?? 'retail'
      const simplifiedRate = SIMPLIFIED_VAT_RATES[industryKey] ?? SIMPLIFIED_VAT_RATES['retail']!
      const payableVatKRW = Math.round(input.revenue * simplifiedRate * appliedRates.vatRate)
      return {
        outputVatKRW: payableVatKRW,
        inputVatKRW: 0,
        payableVatKRW,
        simplifiedRate,
      }
    }

    // 일반과세자
    const outputVatKRW = Math.round(input.revenue * appliedRates.vatRate)
    const inputVatKRW = Math.round(input.deductibleExpenses * appliedRates.vatRate)
    return {
      outputVatKRW,
      inputVatKRW,
      payableVatKRW: outputVatKRW - inputVatKRW,
    }
  }

  // 기존 시그니처 (하위 호환)
  const revenueKRW = revenueOrInput
  const deductibleExpenseKRW =
    typeof deductibleExpenseOrRates === 'number' ? deductibleExpenseOrRates : 0
  const appliedRates =
    typeof deductibleExpenseOrRates === 'object' ? deductibleExpenseOrRates : rates

  const outputVatKRW = Math.round(revenueKRW * appliedRates.vatRate)
  const inputVatKRW = Math.round(deductibleExpenseKRW * appliedRates.vatRate)
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
 * 공제 반영 순서: 과세표준 = 소득 - 기본공제 - 국민연금 - 노란우산공제 (음수면 0)
 *
 * @param incomeKRW 과세대상 소득 (원). 매출 - 비용
 * @param deductions 소득공제 정보
 * @param rates 적용 세율 (기본값: 현재 세율)
 */
export function calculateIncomeTax(
  incomeKRW: number,
  deductions?: Partial<TaxDeductions>,
  rates: TaxRates = CURRENT_TAX_RATES,
): IncomeTaxResult {
  // 1. 소득공제 계산
  const depCount = deductions?.dependents ?? 0  // deductions 미전달 시 공제 없음
  const personalDeduction = depCount * 1_500_000
  const pension = deductions?.nationalPension ?? 0
  const yellowUmbrella = Math.min(deductions?.yellowUmbrella ?? 0, 5_000_000)

  // 2. 공제 전 과세표준 (기본공제만 미적용 기준으로 세액 비교용)
  const taxBaseBeforeDeduction = Math.max(0, incomeKRW)

  // 3. 공제 후 과세표준
  const taxBase = Math.max(0, incomeKRW - personalDeduction - pension - yellowUmbrella)

  /** 세율 구간으로 산출세액 계산하는 헬퍼 */
  function computeTax(base: number): number {
    if (base <= 0) return 0
    const bracket =
      rates.incomeTaxBrackets.find(
        (b) => base >= b.minKRW && (b.maxKRW === null || base < b.maxKRW),
      ) ?? rates.incomeTaxBrackets[rates.incomeTaxBrackets.length - 1]
    if (!bracket) return 0
    return Math.max(0, Math.round(base * bracket.rate - bracket.deductionKRW))
  }

  const taxBeforeDeduction = computeTax(taxBaseBeforeDeduction)

  if (taxBase <= 0) {
    return {
      taxableIncomeKRW: 0,
      calculatedTaxKRW: 0,
      appliedRatePct: 0,
      taxYear: rates.year,
      taxBase: 0,
      tax: 0,
      effectiveRate: 0,
      taxBeforeDeductionKRW: taxBeforeDeduction,
    }
  }

  // 해당하는 구간 찾기
  const bracket = rates.incomeTaxBrackets.find(
    (b) =>
      taxBase >= b.minKRW &&
      (b.maxKRW === null || taxBase < b.maxKRW),
  )

  const appliedBracket = bracket || rates.incomeTaxBrackets[rates.incomeTaxBrackets.length - 1]

  if (!appliedBracket) {
    return {
      taxableIncomeKRW: taxBase,
      calculatedTaxKRW: 0,
      appliedRatePct: 0,
      taxYear: rates.year,
      taxBase,
      tax: 0,
      effectiveRate: 0,
      taxBeforeDeductionKRW: taxBeforeDeduction,
    }
  }

  const calculatedTax = Math.round(
    taxBase * appliedBracket.rate - appliedBracket.deductionKRW,
  )

  const finalTax = Math.max(0, calculatedTax)
  const finalRate = appliedBracket.rate * 100

  return {
    taxableIncomeKRW: taxBase,
    calculatedTaxKRW: finalTax,
    appliedRatePct: finalRate,
    taxYear: rates.year,
    taxBase,
    tax: finalTax,
    effectiveRate: finalRate,
    taxBeforeDeductionKRW: taxBeforeDeduction,
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
