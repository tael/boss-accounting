/**
 * 재무 계산 유틸리티
 * 모든 금액은 정수 원(KRW) 단위로 처리
 */

import type { Transaction, TransactionFilter } from '@/types/transaction'
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
 * 연도/분기의 시작·끝 날짜 반환
 * @param year 연도
 * @param quarter 1-4
 * @returns { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 */
export function getQuarterDateRange(year: number, quarter: number): { from: string; to: string } {
  const startMonth = (quarter - 1) * 3 + 1
  const endMonth = startMonth + 2
  const from = `${year}-${String(startMonth).padStart(2, '0')}-01`
  const endDate = new Date(year, endMonth, 0)
  const to = `${year}-${String(endMonth).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
  return { from, to }
}

/**
 * 특정 연도/분기의 거래 필터링
 * @param quarter 1-4
 */
export function filterByQuarter(
  transactions: Transaction[],
  year: number,
  quarter: number,
): Transaction[] {
  const { from, to } = getQuarterDateRange(year, quarter)
  return transactions.filter((tx) => tx.date >= from && tx.date <= to)
}

export interface VatSummary {
  totalRevenue: number
  totalDeductible: number
}

/**
 * 거래 목록에서 부가세 계산용 매출/적격증빙 비용 합산
 */
export function summarizeForVat(transactions: Transaction[]): VatSummary {
  const totalRevenue = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amountKRW, 0)
  const totalDeductible = transactions
    .filter((tx) => tx.type === 'expense' && tx.isVatDeductible !== false)
    .reduce((sum, tx) => sum + tx.amountKRW, 0)
  return { totalRevenue, totalDeductible }
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
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` // YYYY-MM (로컬 시간 기준)

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

/**
 * 필터 조건으로 거래 목록 필터링 (derived state helper)
 */
export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
): Transaction[] {
  return transactions.filter((tx) => {
    if (filter.type && tx.type !== filter.type) return false
    if (filter.categoryId && tx.categoryId !== filter.categoryId) return false
    if (filter.dateFrom && tx.date < filter.dateFrom) return false
    if (filter.dateTo && tx.date > filter.dateTo) return false
    if (filter.amountMin !== undefined && tx.amountKRW < filter.amountMin) return false
    if (filter.amountMax !== undefined && tx.amountKRW > filter.amountMax) return false
    if (filter.memoSearch) {
      const keyword = filter.memoSearch.toLowerCase()
      if (!tx.memo?.toLowerCase().includes(keyword)) return false
    }
    return true
  })
}

/**
 * 현재 월 포함 최근 N개월 YYYY-MM 배열 반환 (오름차순)
 */
export function getLastNMonths(n: number = 12): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

/**
 * 전년 동기(YoY) 비교 데이터 생성
 * 최근 12개월과 전년 동기 12개월의 매출을 비교
 */
export function calculateYoYComparison(
  transactions: Transaction[],
): Array<{ month: string; thisYear: number; lastYear: number }> {
  const months = getLastNMonths(12)
  return months.map((ym) => {
    const [y, m] = ym.split('-').map(Number)
    const lastYearYm = `${y! - 1}-${String(m).padStart(2, '0')}`

    const thisYearIncome = transactions
      .filter((tx) => tx.type === 'income' && tx.date.startsWith(ym))
      .reduce((sum, tx) => sum + tx.amountKRW, 0)

    const lastYearIncome = transactions
      .filter((tx) => tx.type === 'income' && tx.date.startsWith(lastYearYm))
      .reduce((sum, tx) => sum + tx.amountKRW, 0)

    return { month: ym, thisYear: thisYearIncome, lastYear: lastYearIncome }
  })
}

export interface BusinessHealthResult {
  score: number                  // 0-100
  grade: 'danger' | 'warning' | 'good' | 'excellent'
  profitabilityScore: number     // 0-40
  stabilityScore: number         // 0-30
  growthScore: number            // 0-30
  summary: string
  hasData: boolean               // 거래 데이터 유무
}

/**
 * 사업 건강도 점수 계산 (0-100)
 * - 수익성(40점): 이번 달 이익률 기준 (0% → 0, 10% → 20, 20% → 30, 30%+ → 40)
 * - 안정성(30점): 최근 3개월 중 흑자 달 수 × 10점
 * - 성장성(30점): 최근 2달 vs 이전 2달 매출 비교 (증가 30, 유지 15, 감소 0)
 *
 * 등급: 0-39 danger, 40-59 warning, 60-79 good, 80+ excellent
 */
export function calculateBusinessHealth(transactions: Transaction[]): BusinessHealthResult {
  if (transactions.length === 0) {
    return {
      score: 0,
      grade: 'danger',
      profitabilityScore: 0,
      stabilityScore: 0,
      growthScore: 0,
      summary: '거래를 입력하면 건강도를 측정할 수 있어요.',
      hasData: false,
    }
  }

  // 수익성(40점): 이번 달 이익률
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonthTxs = filterByMonth(transactions, thisMonth)
  const thisMonthStatement = calculateIncomeStatement(thisMonthTxs, thisMonth)
  const marginPct = thisMonthStatement.profitMarginPct

  let profitabilityScore: number
  if (marginPct >= 30) profitabilityScore = 40
  else if (marginPct >= 20) profitabilityScore = 30
  else if (marginPct >= 10) profitabilityScore = 20
  else if (marginPct > 0) profitabilityScore = Math.round((marginPct / 10) * 20)
  else profitabilityScore = 0

  // 안정성(30점): 최근 3개월 중 흑자 달 수 × 10점
  const last3Months = getLastNMonths(3)
  let surplusCount = 0
  for (const month of last3Months) {
    const monthTxs = filterByMonth(transactions, month)
    const stmt = calculateIncomeStatement(monthTxs, month)
    if (stmt.netProfitKRW > 0) surplusCount++
  }
  const stabilityScore = surplusCount * 10

  // 성장성(30점): 최근 2달 vs 이전 2달 매출 비교
  const last4Months = getLastNMonths(4)
  const prev2Revenue = last4Months.slice(0, 2).reduce((sum, m) => {
    return (
      sum +
      filterByMonth(transactions, m)
        .filter((tx) => tx.type === 'income')
        .reduce((s, tx) => s + tx.amountKRW, 0)
    )
  }, 0)
  const recent2Revenue = last4Months.slice(2, 4).reduce((sum, m) => {
    return (
      sum +
      filterByMonth(transactions, m)
        .filter((tx) => tx.type === 'income')
        .reduce((s, tx) => s + tx.amountKRW, 0)
    )
  }, 0)

  let growthScore: number
  if (prev2Revenue === 0 && recent2Revenue === 0) {
    growthScore = 0
  } else if (prev2Revenue === 0) {
    // 이전엔 매출이 없다가 최근에 생긴 경우 → 증가로 간주
    growthScore = 30
  } else {
    const changePct = ((recent2Revenue - prev2Revenue) / prev2Revenue) * 100
    if (changePct > 5) growthScore = 30
    else if (changePct >= -5) growthScore = 15
    else growthScore = 0
  }

  const score = profitabilityScore + stabilityScore + growthScore

  let grade: BusinessHealthResult['grade']
  if (score >= 80) grade = 'excellent'
  else if (score >= 60) grade = 'good'
  else if (score >= 40) grade = 'warning'
  else grade = 'danger'

  let summary: string
  switch (grade) {
    case 'excellent':
      summary = '매우 건강한 상태예요. 지금 흐름을 유지해보세요.'
      break
    case 'good':
      summary = '양호한 상태예요. 조금 더 신경쓰면 우수 단계로 올라갈 수 있어요.'
      break
    case 'warning':
      summary = '주의가 필요해요. 수익성 또는 안정성을 점검해보세요.'
      break
    case 'danger':
    default:
      summary = '위험 신호예요. 비용 구조와 매출 흐름을 바로 점검해야 해요.'
      break
  }

  return {
    score,
    grade,
    profitabilityScore,
    stabilityScore,
    growthScore,
    summary,
    hasData: true,
  }
}

export interface BreakEvenResult {
  bepRevenue: number | null   // null이면 계산 불가
  variableRatio: number       // 변동비율 (0-1)
  isInfeasible: boolean       // true이면 BEP 달성 불가 (변동비율 >= 1)
}

/**
 * 손익분기점(BEP) 매출액 계산
 * 공식: BEP = 고정비 / (1 - 변동비율), 변동비율 = 변동비 / 매출
 * revenueKRW가 0이면 변동비율을 (변동비 / (고정비 + 변동비))로 추정 (직접 입력 모드 대응)
 * @param fixedCostKRW  고정비 (원)
 * @param variableCostKRW  변동비 (원)
 * @param revenueKRW  기준 매출 (원, 0이면 추정 모드)
 * @returns BreakEvenResult
 */
export function calculateBreakEven(
  fixedCostKRW: number,
  variableCostKRW: number,
  revenueKRW: number = 0,
): BreakEvenResult {
  if (fixedCostKRW <= 0) {
    return { bepRevenue: null, variableRatio: 0, isInfeasible: false }
  }

  let variableRatio: number
  if (revenueKRW > 0) {
    variableRatio = variableCostKRW / revenueKRW
  } else {
    const totalCost = fixedCostKRW + variableCostKRW
    variableRatio = totalCost > 0 ? variableCostKRW / totalCost : 0
  }

  if (variableRatio >= 1) {
    return { bepRevenue: null, variableRatio, isInfeasible: true }
  }

  const raw = fixedCostKRW / (1 - variableRatio)
  if (!isFinite(raw) || isNaN(raw) || raw < 0) {
    return { bepRevenue: null, variableRatio, isInfeasible: raw < 0 }
  }

  return { bepRevenue: Math.ceil(raw), variableRatio, isInfeasible: false }
}

/**
 * 전월 대비 카테고리별 지출 비교
 */
export function calculateMonthlyExpenseComparison(
  transactions: Transaction[],
): Array<{ category: string; thisMonth: number; lastMonth: number; changeRate: number }> {
  const now = new Date()
  const thisYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastYm = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`

  return EXPENSE_CATEGORIES.map((cat) => {
    const thisMonth = transactions
      .filter((tx) => tx.type === 'expense' && tx.categoryId === cat.id && tx.date.startsWith(thisYm))
      .reduce((sum, tx) => sum + tx.amountKRW, 0)
    const lastMonth = transactions
      .filter((tx) => tx.type === 'expense' && tx.categoryId === cat.id && tx.date.startsWith(lastYm))
      .reduce((sum, tx) => sum + tx.amountKRW, 0)
    const changeRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0
    return { category: cat.name, thisMonth, lastMonth, changeRate }
  }).filter((item) => item.thisMonth > 0 || item.lastMonth > 0)
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

  // 현재 날짜 기준 최근 N개월 (활동 없는 달도 포함, 빈 달은 0원으로 집계)
  const targetMonths = getLastNMonths(months)

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

export interface BusinessLevel {
  level: number
  title: string
  nextTitle: string
  progress: number // 0-100
}

/**
 * 사장님 레벨 계산
 * @param totalTransactions 전체 거래 건수
 * @param totalProfitKRW 전체 누적 순이익 (현재는 보조 지표)
 */
export function getBusinessLevel(
  totalTransactions: number,
  totalProfitKRW: number,
): BusinessLevel {
  void totalProfitKRW // 향후 레벨 산정에 활용 예정

  const levels = [
    { min: 0, title: '구멍가게 사장님' },
    { min: 10, title: '골목 대장' },
    { min: 50, title: '동네 명소' },
    { min: 100, title: '지역 터줏대감' },
    { min: 200, title: '업계 고수' },
    { min: 500, title: '사업의 달인' },
  ]

  let currentLevelIdx = 0
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalTransactions >= levels[i]!.min) {
      currentLevelIdx = i
      break
    }
  }

  const nextLevelIdx = Math.min(currentLevelIdx + 1, levels.length - 1)
  const currentMin = levels[currentLevelIdx]!.min
  const nextMin = levels[nextLevelIdx]!.min

  const progress =
    currentLevelIdx === levels.length - 1
      ? 100
      : Math.min(100, Math.round(((totalTransactions - currentMin) / (nextMin - currentMin)) * 100))

  return {
    level: currentLevelIdx + 1,
    title: levels[currentLevelIdx]!.title,
    nextTitle: levels[nextLevelIdx]!.title,
    progress,
  }
}
