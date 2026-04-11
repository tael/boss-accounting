/**
 * 재무 계산 유틸리티
 * 모든 금액은 정수 원(KRW) 단위로 처리
 */

import type { Transaction } from '@/types/transaction'
import type { CategorySummary, IncomeStatement, CashFlowEntry } from '@/types/financial'
import { getCategoryName } from '@/constants/categories'

/**
 * 카테고리별 합계 계산
 */
export function sumByCategory(transactions: Transaction[]): CategorySummary[] {
  const map = new Map<string, { total: number; count: number }>()

  for (const tx of transactions) {
    const existing = map.get(tx.categoryId) ?? { total: 0, count: 0 }
    map.set(tx.categoryId, {
      total: existing.total + tx.amountKRW,
      count: existing.count + 1,
    })
  }

  return Array.from(map.entries()).map(([categoryId, { total, count }]) => ({
    categoryId,
    categoryName: getCategoryName(categoryId),
    totalKRW: total,
    count,
  }))
}

/**
 * 손익계산서 계산
 * @param transactions 해당 기간의 거래 목록
 * @param period 기간 레이블 (예: "2025-01")
 */
export function calculateIncomeStatement(
  transactions: Transaction[],
  period: string,
): IncomeStatement {
  const incomeTransactions = transactions.filter((tx) => tx.type === 'income')
  const expenseTransactions = transactions.filter((tx) => tx.type === 'expense')

  const totalIncomeKRW = incomeTransactions.reduce((sum, tx) => sum + tx.amountKRW, 0)
  const totalExpenseKRW = expenseTransactions.reduce((sum, tx) => sum + tx.amountKRW, 0)
  const netProfitKRW = totalIncomeKRW - totalExpenseKRW
  const profitMarginPct =
    totalIncomeKRW > 0 ? (netProfitKRW / totalIncomeKRW) * 100 : 0

  return {
    period,
    totalIncomeKRW,
    totalExpenseKRW,
    netProfitKRW,
    profitMarginPct,
    incomeByCategory: sumByCategory(incomeTransactions),
    expenseByCategory: sumByCategory(expenseTransactions),
  }
}

/**
 * 월별 현금흐름 계산
 * @param transactions 전체 거래 목록
 * @returns 월별 정렬된 현금흐름 배열
 */
export function calculateCashFlow(transactions: Transaction[]): CashFlowEntry[] {
  const map = new Map<string, { inflow: number; outflow: number }>()

  for (const tx of transactions) {
    const month = tx.date.slice(0, 7) // YYYY-MM
    const existing = map.get(month) ?? { inflow: 0, outflow: 0 }

    if (tx.type === 'income') {
      map.set(month, { ...existing, inflow: existing.inflow + tx.amountKRW })
    } else {
      map.set(month, { ...existing, outflow: existing.outflow + tx.amountKRW })
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { inflow, outflow }]) => ({
      month,
      inflowKRW: inflow,
      outflowKRW: outflow,
      netCashFlowKRW: inflow - outflow,
    }))
}

/**
 * 이익률 계산
 * @param incomeKRW 총 매출 (원)
 * @param expenseKRW 총 비용 (원)
 * @returns 이익률 (%, 소수점 2자리)
 */
export function calculateProfitMargin(incomeKRW: number, expenseKRW: number): number {
  if (incomeKRW <= 0) return 0
  const netProfit = incomeKRW - expenseKRW
  return (netProfit / incomeKRW) * 100
}

/**
 * 특정 월의 거래 필터링
 * @param transactions 전체 거래 목록
 * @param yearMonth YYYY-MM 형식
 */
export function filterByMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter((tx) => tx.date.startsWith(yearMonth))
}

/**
 * 날짜 범위로 거래 필터링
 * @param transactions 전체 거래 목록
 * @param dateFrom YYYY-MM-DD (포함)
 * @param dateTo YYYY-MM-DD (포함)
 */
export function filterByDateRange(
  transactions: Transaction[],
  dateFrom: string,
  dateTo: string,
): Transaction[] {
  return transactions.filter((tx) => tx.date >= dateFrom && tx.date <= dateTo)
}

/**
 * 변화율 계산 (전기 대비)
 * @returns 변화율 (%). 전기값이 0이면 0 반환
 */
export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / Math.abs(previous)) * 100
}
