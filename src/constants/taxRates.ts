/**
 * 세율 상수
 * 적용 연도 메타데이터 포함 — UI에 면책 문구와 함께 표시해야 함
 *
 * 주의: 세법은 매년 변경될 수 있습니다.
 * 본 데이터는 2025년 기준이며, 실제 세금 신고 시 세무사 상담을 권장합니다.
 */

export interface IncomeTaxBracket {
  /** 과세표준 하한 (원, 포함) */
  minKRW: number
  /** 과세표준 상한 (원, 미만. null이면 상한 없음) */
  maxKRW: number | null
  /** 세율 (예: 0.06 = 6%) */
  rate: number
  /** 누진공제액 (원) */
  deductionKRW: number
}

export interface TaxRates {
  /** 적용 연도 */
  year: number
  /** 적용 시작일 (ISO 8601) */
  effectiveFrom: string
  /** 부가가치세율 */
  vatRate: number
  /** 종합소득세 과세표준 구간별 세율 */
  incomeTaxBrackets: IncomeTaxBracket[]
}

/**
 * 2025년 세율 기준
 * 출처: 소득세법 제55조 (2025년 기준)
 */
export const TAX_RATES_2025: TaxRates = {
  year: 2025,
  effectiveFrom: '2025-01-01',
  vatRate: 0.1, // 10%

  // 종합소득세 누진세율 구조 (2023년 이후 동일)
  incomeTaxBrackets: [
    {
      minKRW: 0,
      maxKRW: 14_000_000,
      rate: 0.06,
      deductionKRW: 0,
    },
    {
      minKRW: 14_000_000,
      maxKRW: 50_000_000,
      rate: 0.15,
      deductionKRW: 1_260_000,
    },
    {
      minKRW: 50_000_000,
      maxKRW: 88_000_000,
      rate: 0.24,
      deductionKRW: 5_760_000,
    },
    {
      minKRW: 88_000_000,
      maxKRW: 150_000_000,
      rate: 0.35,
      deductionKRW: 15_440_000,
    },
    {
      minKRW: 150_000_000,
      maxKRW: 300_000_000,
      rate: 0.38,
      deductionKRW: 19_940_000,
    },
    {
      minKRW: 300_000_000,
      maxKRW: 500_000_000,
      rate: 0.40,
      deductionKRW: 25_940_000,
    },
    {
      minKRW: 500_000_000,
      maxKRW: 1_000_000_000,
      rate: 0.42,
      deductionKRW: 35_940_000,
    },
    {
      minKRW: 1_000_000_000,
      maxKRW: null,
      rate: 0.45,
      deductionKRW: 65_940_000,
    },
  ],
}

/** 현재 적용 세율 (기본값) */
export const CURRENT_TAX_RATES = TAX_RATES_2025

/** 세금 면책 문구 */
export const TAX_DISCLAIMER =
  `본 계산은 ${CURRENT_TAX_RATES.year}년 세율 기준 참고용이며, 실제 세금 신고 시 세무사 상담을 권장합니다.`

/** 종합소득세 소득공제 상수 (2025년 기준) */
export const TAX_DEDUCTION_CONSTANTS = {
  /** 부양가족 1인당 기본공제 (원) */
  PERSONAL_DEDUCTION_PER_DEPENDENT: 1_500_000,
  /** 노란우산공제 연간 납입 한도 (원) */
  YELLOW_UMBRELLA_MAX: 5_000_000,
} as const
