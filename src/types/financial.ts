/**
 * 재무 관련 타입 정의
 * 모든 금액은 정수 원(KRW) 단위
 */

/** 카테고리별 집계 */
export interface CategorySummary {
  categoryId: string
  categoryName: string
  totalKRW: number
  count: number
}

/** 손익계산서 */
export interface IncomeStatement {
  /** 기간 (예: "2025-01", "2025-Q1", "2025") */
  period: string
  /** 총 매출 (원) */
  totalIncomeKRW: number
  /** 총 비용 (원) */
  totalExpenseKRW: number
  /** 순이익 (원) = 총 매출 - 총 비용 */
  netProfitKRW: number
  /** 이익률 (%) = 순이익 / 총 매출 * 100 */
  profitMarginPct: number
  /** 매출 카테고리별 내역 */
  incomeByCategory: CategorySummary[]
  /** 비용 카테고리별 내역 */
  expenseByCategory: CategorySummary[]
}

/** 현금흐름 항목 */
export interface CashFlowEntry {
  /** 월 (YYYY-MM) */
  month: string
  /** 현금 유입 (원) */
  inflowKRW: number
  /** 현금 유출 (원) */
  outflowKRW: number
  /** 순 현금흐름 (원) */
  netCashFlowKRW: number
}

/** 핵심 재무 요약 */
export interface FinancialSummary {
  /** 기준 월 (YYYY-MM) */
  currentMonth: string
  /** 이번 달 매출 */
  currentMonthIncomeKRW: number
  /** 이번 달 비용 */
  currentMonthExpenseKRW: number
  /** 이번 달 순이익 */
  currentMonthProfitKRW: number
  /** 이번 달 이익률 (%) */
  currentMonthProfitMarginPct: number
  /** 전월 대비 매출 변화율 (%) */
  incomeChangeRatePct: number
  /** 전월 대비 비용 변화율 (%) */
  expenseChangeRatePct: number
  /** 전월 대비 순이익 변화율 (%) */
  profitChangeRatePct: number
}
