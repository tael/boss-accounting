/**
 * 세금 계산 유틸리티
 * 모든 금액은 정수 원(KRW) 단위로 처리
 */

import { CURRENT_TAX_RATES, TAX_DEDUCTION_CONSTANTS, INSURANCE_RATES_2025 } from '@/constants/taxRates'
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
  const personalDeduction = depCount * TAX_DEDUCTION_CONSTANTS.PERSONAL_DEDUCTION_PER_DEPENDENT
  const pension = deductions?.nationalPension ?? 0
  const yellowUmbrella = Math.min(deductions?.yellowUmbrella ?? 0, TAX_DEDUCTION_CONSTANTS.YELLOW_UMBRELLA_MAX)

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
    taxBeforeDeductionKRW: taxBeforeDeduction,
  }
}

/**
 * 노란우산공제 절세 효과 계산
 * 노란우산 공제 미적용 시 세액 vs 적용 시 세액의 차이를 반환
 *
 * @param result calculateIncomeTax 결과 (공제 포함)
 * @param deductions 현재 공제 정보
 * @returns 절세액 (원). 노란우산 미적용이거나 공제 0이면 0 반환
 */
export function calculateYellowUmbrellaSaving(
  result: IncomeTaxResult,
  deductions: Partial<TaxDeductions>,
): number {
  const yellowUmbrellaApplied = Math.min(deductions.yellowUmbrella ?? 0, TAX_DEDUCTION_CONSTANTS.YELLOW_UMBRELLA_MAX)
  if (yellowUmbrellaApplied <= 0) return 0

  const resultWithoutYellow = calculateIncomeTax(
    result.taxableIncomeKRW + yellowUmbrellaApplied,
    { ...deductions, yellowUmbrella: 0 },
  )
  return resultWithoutYellow.calculatedTaxKRW - result.calculatedTaxKRW
}

export interface LaborCostResult {
  /** 기본 주급 (원) */
  baseWeeklyPay: number
  /** 주휴수당 (원). 주 15시간 미만이면 0 */
  weeklyHolidayPay: number
  /** 주 총 인건비 */
  totalWeeklyPay: number
  /** 월 환산 총 인건비 (× 4.345주) */
  totalMonthlyPay: number
  /** 주휴수당 발생 여부 */
  isEligible: boolean
}

export interface TrueLaborCostResult extends LaborCostResult {
  /** 국민연금 사용자 부담 (원, 월) */
  nationalPension: number
  /** 건강보험 사용자 부담 (원, 월) */
  healthInsurance: number
  /** 고용보험 사용자 부담 (원, 월) */
  employmentInsurance: number
  /** 산재보험 (원, 월) */
  industrialAccident: number
  /** 4대 보험 합계 (원, 월) */
  totalInsurance: number
  /** 총 인건비 + 4대 보험 합계 (원, 월) */
  trueMonthlyCost: number
}

export function calculateLaborCost(
  hourlyWage: number,
  weeklyHours: number,
): LaborCostResult {
  const baseWeeklyPay = Math.round(hourlyWage * weeklyHours)
  const isEligible = weeklyHours >= 15
  const weeklyHolidayPay = isEligible
    ? Math.round(hourlyWage * (weeklyHours / 40) * 8)
    : 0
  const totalWeeklyPay = baseWeeklyPay + weeklyHolidayPay
  const totalMonthlyPay = Math.round(totalWeeklyPay * 4.345)
  return { baseWeeklyPay, weeklyHolidayPay, totalWeeklyPay, totalMonthlyPay, isEligible }
}

/**
 * 4대 보험 포함 실질 인건비 계산 (2025년 요율 적용)
 * 사용자(사업주) 부담분 기준
 *
 * @param hourlyWage 시급 (원)
 * @param weeklyHours 주당 근무시간
 */
export function calculateTrueLaborCost(
  hourlyWage: number,
  weeklyHours: number,
): TrueLaborCostResult {
  const base = calculateLaborCost(hourlyWage, weeklyHours)
  const monthly = base.totalMonthlyPay

  const nationalPension = Math.round(monthly * INSURANCE_RATES_2025.nationalPension)
  const healthInsurance = Math.round(monthly * INSURANCE_RATES_2025.healthInsurance)
  const employmentInsurance = Math.round(monthly * INSURANCE_RATES_2025.employmentInsurance)
  const industrialAccident = Math.round(monthly * INSURANCE_RATES_2025.industrialAccident)
  const totalInsurance = nationalPension + healthInsurance + employmentInsurance + industrialAccident
  const trueMonthlyCost = monthly + totalInsurance

  return {
    ...base,
    nationalPension,
    healthInsurance,
    employmentInsurance,
    industrialAccident,
    totalInsurance,
    trueMonthlyCost,
  }
}

export interface AnnualTaxForecast {
  /** 올해 현재까지 순이익 (원) */
  currentNetIncomeKRW: number
  /** 연말까지 추정 연소득 (원). 월 평균 × 12 */
  projectedAnnualIncomeKRW: number
  /** 현재 소득 기준 세율 구간 */
  currentBracket: import('@/constants/taxRates').IncomeTaxBracket | null
  /** 추정 연소득 기준 세율 구간 */
  projectedBracket: import('@/constants/taxRates').IncomeTaxBracket | null
  /** 세율 구간 변경 여부 */
  willBracketChange: boolean
  /** 다음 구간까지 남은 금액 (원). 이미 최고 구간이면 null */
  amountToNextBracketKRW: number | null
  /** 추정 연소득 기준 종합소득세 산출세액 (원) */
  projectedTaxKRW: number
  /** 현재 월 인덱스 (1-12) */
  currentMonthIndex: number
}

/**
 * 연말 과세표준 추정 및 세율 구간 변경 경고
 *
 * 추정 방식: 현재 순이익 ÷ 경과 월수 × 12
 *
 * @param currentNetIncomeKRW 올해 현재까지 순이익 (원)
 * @param currentMonthIndex 현재 월 (1-12)
 * @param rates 적용 세율 (기본값: 현재 세율)
 */
export function forecastAnnualTax(
  currentNetIncomeKRW: number,
  currentMonthIndex: number,
  rates: TaxRates = CURRENT_TAX_RATES,
): AnnualTaxForecast {
  const monthIndex = Math.max(1, Math.min(12, currentMonthIndex))

  // 월 평균 × 12로 연 소득 추정
  const monthlyAvg = currentNetIncomeKRW / monthIndex
  const projectedAnnualIncomeKRW = Math.round(monthlyAvg * 12)

  /** 세율 구간 찾기 헬퍼 */
  function findBracket(income: number) {
    if (income <= 0) return null
    return (
      rates.incomeTaxBrackets.find(
        (b) => income >= b.minKRW && (b.maxKRW === null || income < b.maxKRW),
      ) ?? rates.incomeTaxBrackets[rates.incomeTaxBrackets.length - 1] ?? null
    )
  }

  const currentBracket = findBracket(currentNetIncomeKRW)
  const projectedBracket = findBracket(projectedAnnualIncomeKRW)

  const willBracketChange =
    currentBracket !== null &&
    projectedBracket !== null &&
    currentBracket.rate !== projectedBracket.rate

  // 다음 구간 시작점까지 남은 금액 (현재 소득 기준)
  let amountToNextBracketKRW: number | null = null
  if (currentBracket !== null && currentBracket.maxKRW !== null) {
    amountToNextBracketKRW = currentBracket.maxKRW - currentNetIncomeKRW
  }

  // 추정 연소득 기준 산출세액
  const projectedTaxKRW =
    projectedAnnualIncomeKRW > 0
      ? calculateIncomeTax(projectedAnnualIncomeKRW, undefined, rates).calculatedTaxKRW
      : 0

  return {
    currentNetIncomeKRW,
    projectedAnnualIncomeKRW,
    currentBracket,
    projectedBracket,
    willBracketChange,
    amountToNextBracketKRW,
    projectedTaxKRW,
    currentMonthIndex: monthIndex,
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
