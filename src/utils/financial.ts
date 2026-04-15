/**
 * 재무 계산 유틸리티
 * 모든 금액은 정수 원(KRW) 단위로 처리
 */

import type { Transaction } from '@/types/transaction'
import type { CategorySummary, IncomeStatement, CashFlowEntry } from '@/types/financial'
import { getCategoryName, EXPENSE_CATEGORIES } from '@/constants/categories'
import type { BookReferenceKey } from '@/constants/bookReferences'

export interface FinancialInsight {
  type: 'warning' | 'info' | 'success'
  message: string
  bookRefKey?: BookReferenceKey // bookReferences 키
  priority: number   // 높을수록 먼저 표시
}

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

/**
 * 데이터 기반 인사이트 생성
 */
export function generateInsights(transactions: Transaction[]): FinancialInsight[] {
  const insights: FinancialInsight[] = []

  if (transactions.length === 0) {
    return [
      {
        type: 'info',
        message: '거래를 입력하면 맞춤 인사이트를 제공해드려요.',
        priority: 0,
      },
    ]
  }

  const now = new Date()
  const thisMonth = now.toISOString().slice(0, 7) // YYYY-MM

  const currentMonthTransactions = filterByMonth(transactions, thisMonth)
  const incomeStatement = calculateIncomeStatement(currentMonthTransactions, thisMonth)

  // 1. 인건비 비중 > 40%
  const laborExpense =
    incomeStatement.expenseByCategory.find((c) => c.categoryId === 'expense-labor')?.totalKRW ?? 0
  if (incomeStatement.totalIncomeKRW > 0) {
    const laborRatio = (laborExpense / incomeStatement.totalIncomeKRW) * 100
    if (laborRatio > 40) {
      insights.push({
        type: 'warning',
        message: `인건비가 매출의 ${Math.round(laborRatio)}%입니다. 적정 수준(30% 이하)을 초과했어요.`,
        bookRefKey: 'transactions.expenseDeduction',
        priority: 5,
      })
    }
  }

  // 2. 이익률 < 10%
  if (incomeStatement.totalIncomeKRW > 0 && incomeStatement.profitMarginPct < 10) {
    insights.push({
      type: 'warning',
      message: `이익률이 ${Math.round(incomeStatement.profitMarginPct)}%로 낮습니다. 비용 구조를 점검해보세요.`,
      bookRefKey: 'analysis.breakEven',
      priority: 4,
    })
  }

  // 3. 이익률 > 30%
  if (incomeStatement.totalIncomeKRW > 0 && incomeStatement.profitMarginPct > 30) {
    insights.push({
      type: 'success',
      message: `이익률이 ${Math.round(incomeStatement.profitMarginPct)}%로 양호합니다! 잘 하고 계세요.`,
      bookRefKey: 'dashboard.profitMargin',
      priority: 3,
    })
  }

  // 4. 3개월 연속 매출 증가
  const cashFlow = calculateCashFlow(transactions)
  if (cashFlow.length >= 3) {
    const last3Months = cashFlow.slice(-3)
    if (
      last3Months[1].inflowKRW > last3Months[0].inflowKRW &&
      last3Months[2].inflowKRW > last3Months[1].inflowKRW
    ) {
      insights.push({
        type: 'success',
        message: '3개월 연속 매출이 증가하고 있어요!',
        priority: 2,
      })
    }
  }

  return insights.sort((a, b) => b.priority - a.priority)
}

export interface CostStructure {
  avgFixedCost: number
  avgVariableCost: number
  avgRevenue: number
  monthRange: { from: string; to: string }
}

/**
 * 최근 N개월 거래를 기반으로 고정비/변동비/매출 평균 계산
 * EXPENSE_CATEGORIES의 costType으로 fixed/variable 분류 (semi는 고정비에 포함)
 */
export function calculateCostStructure(
  transactions: Transaction[],
  months: number = 3,
): CostStructure {
  if (transactions.length === 0) {
    return { avgFixedCost: 0, avgVariableCost: 0, avgRevenue: 0, monthRange: { from: '', to: '' } }
  }

  // 모든 거래에서 YYYY-MM 추출 후 최근 N개월 선택
  const allMonths = Array.from(new Set(transactions.map((tx) => tx.date.slice(0, 7)))).sort()
  const targetMonths = allMonths.slice(-months)

  if (targetMonths.length === 0) {
    return { avgFixedCost: 0, avgVariableCost: 0, avgRevenue: 0, monthRange: { from: '', to: '' } }
  }

  // costType 조회 맵: categoryId → 'fixed' | 'variable' | 'semi'
  const costTypeMap = new Map(
    EXPENSE_CATEGORIES.map((c) => [c.id, c.costType ?? 'semi']),
  )

  let totalFixed = 0
  let totalVariable = 0
  let totalRevenue = 0

  for (const month of targetMonths) {
    const monthTxs = transactions.filter((tx) => tx.date.startsWith(month))

    for (const tx of monthTxs) {
      if (tx.type === 'income') {
        totalRevenue += tx.amountKRW
      } else {
        const ct = costTypeMap.get(tx.categoryId) ?? 'semi'
        if (ct === 'variable') {
          totalVariable += tx.amountKRW
        } else {
          // fixed, semi 모두 고정비로 집계
          totalFixed += tx.amountKRW
        }
      }
    }
  }

  const count = targetMonths.length
  return {
    avgFixedCost: Math.round(totalFixed / count),
    avgVariableCost: Math.round(totalVariable / count),
    avgRevenue: Math.round(totalRevenue / count),
    monthRange: { from: targetMonths[0]!, to: targetMonths[targetMonths.length - 1]! },
  }
}
