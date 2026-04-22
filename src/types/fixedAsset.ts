/**
 * 사업용 고정자산 타입 정의
 * 국세청 기준 내용연수(년)에 따라 월별 감가상각비를 자동 계상
 * 금액은 항상 정수 원(KRW) 단위로 저장
 */

export interface FixedAsset {
  /** 고유 식별자 (UUID) */
  id: string
  /** 자산 명 (예: 사무용 노트북) */
  name: string
  /** 취득일 (ISO 8601 형식: YYYY-MM-DD) */
  purchaseDate: string
  /** 취득가 (정수 원 단위) */
  purchaseCostKRW: number
  /** 내용연수 (년). 국세청 기준 프리셋 또는 직접 입력 */
  usefulLifeYears: number
  /** 잔존가치 (정수 원 단위, 기본 0) */
  residualValueKRW: number
  /** 월 감가상각액 (자동 계산: (취득가 - 잔존가치) / (내용연수 * 12)) */
  monthlyDepreciationKRW: number
  /** 감가상각비 거래에 사용할 카테고리 ID (기본: expense-depreciation) */
  depreciationCategoryId: string
  /** 활성 여부 (비활성 시 자동 상각 제외) */
  enabled: boolean
  /** 마지막 자동 상각 월 (YYYY-MM, 중복 방지) */
  lastAppliedMonth?: string
}

/** 자산 입력용 타입 (id, monthlyDepreciationKRW, lastAppliedMonth 제외) */
export type FixedAssetInput = Omit<
  FixedAsset,
  'id' | 'monthlyDepreciationKRW' | 'lastAppliedMonth'
>
