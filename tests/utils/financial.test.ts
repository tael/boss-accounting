/**
 * financial.ts 유틸리티 단위 테스트
 */

import { describe, it, expect } from 'vitest'
import {
  sumByCategory,
  calculateIncomeStatement,
  calculateCashFlow,
  calculateProfitMargin,
  filterByMonth,
  filterByDateRange,
  calculateChangeRate,
} from '@/utils/financial'
import type { Transaction } from '@/types/transaction'

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'test-id',
  type: 'income',
  date: '2025-01-15',
  amountKRW: 1_000_000,
  categoryId: 'income-service',
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  ...overrides,
})

const sampleTransactions: Transaction[] = [
  makeTransaction({ id: '1', type: 'income', amountKRW: 5_000_000, categoryId: 'income-service', date: '2025-01-10' }),
  makeTransaction({ id: '2', type: 'income', amountKRW: 2_000_000, categoryId: 'income-goods', date: '2025-01-20' }),
  makeTransaction({ id: '3', type: 'expense', amountKRW: 1_000_000, categoryId: 'expense-rent', date: '2025-01-05' }),
  makeTransaction({ id: '4', type: 'expense', amountKRW: 500_000, categoryId: 'expense-labor', date: '2025-01-25' }),
  makeTransaction({ id: '5', type: 'income', amountKRW: 3_000_000, categoryId: 'income-service', date: '2025-02-10' }),
]

describe('sumByCategory', () => {
  it('카테고리별 합계를 올바르게 계산한다', () => {
    const income = sampleTransactions.filter((tx) => tx.type === 'income')
    const result = sumByCategory(income)

    const serviceCategory = result.find((r) => r.categoryId === 'income-service')
    expect(serviceCategory?.totalKRW).toBe(8_000_000) // 5M + 3M
    expect(serviceCategory?.count).toBe(2)

    const goodsCategory = result.find((r) => r.categoryId === 'income-goods')
    expect(goodsCategory?.totalKRW).toBe(2_000_000)
    expect(goodsCategory?.count).toBe(1)
  })

  it('빈 배열이면 빈 결과를 반환한다', () => {
    expect(sumByCategory([])).toEqual([])
  })
})

describe('calculateIncomeStatement', () => {
  it('손익계산서를 올바르게 계산한다', () => {
    const jan = sampleTransactions.filter((tx) => tx.date.startsWith('2025-01'))
    const result = calculateIncomeStatement(jan, '2025-01')

    expect(result.period).toBe('2025-01')
    expect(result.totalIncomeKRW).toBe(7_000_000) // 5M + 2M
    expect(result.totalExpenseKRW).toBe(1_500_000) // 1M + 0.5M
    expect(result.netProfitKRW).toBe(5_500_000)
    // 이익률: 5.5M / 7M * 100 ≈ 78.57%
    expect(result.profitMarginPct).toBeCloseTo(78.57, 1)
  })

  it('매출이 0이면 이익률이 0이다', () => {
    const onlyExpenses = sampleTransactions.filter((tx) => tx.type === 'expense')
    const result = calculateIncomeStatement(onlyExpenses, '2025-01')

    expect(result.totalIncomeKRW).toBe(0)
    expect(result.profitMarginPct).toBe(0)
  })

  it('순이익이 음수(적자)일 수 있다', () => {
    const txs: Transaction[] = [
      makeTransaction({ id: 'a', type: 'income', amountKRW: 500_000 }),
      makeTransaction({ id: 'b', type: 'expense', amountKRW: 1_000_000 }),
    ]
    const result = calculateIncomeStatement(txs, '2025-01')
    expect(result.netProfitKRW).toBe(-500_000)
  })

  it('정수 원 단위 연산으로 부동소수점 오차가 없다', () => {
    const txs: Transaction[] = [
      makeTransaction({ id: 'a', type: 'income', amountKRW: 3_333_333 }),
      makeTransaction({ id: 'b', type: 'expense', amountKRW: 1_111_111 }),
    ]
    const result = calculateIncomeStatement(txs, '2025-01')
    expect(result.netProfitKRW).toBe(2_222_222)
    expect(Number.isInteger(result.netProfitKRW)).toBe(true)
  })
})

describe('calculateCashFlow', () => {
  it('월별 현금흐름을 올바르게 계산한다', () => {
    const result = calculateCashFlow(sampleTransactions)

    const jan = result.find((r) => r.month === '2025-01')
    expect(jan?.inflowKRW).toBe(7_000_000)
    expect(jan?.outflowKRW).toBe(1_500_000)
    expect(jan?.netCashFlowKRW).toBe(5_500_000)

    const feb = result.find((r) => r.month === '2025-02')
    expect(feb?.inflowKRW).toBe(3_000_000)
    expect(feb?.outflowKRW).toBe(0)
    expect(feb?.netCashFlowKRW).toBe(3_000_000)
  })

  it('월 순서로 정렬된다', () => {
    const result = calculateCashFlow(sampleTransactions)
    expect(result[0]?.month).toBe('2025-01')
    expect(result[1]?.month).toBe('2025-02')
  })
})

describe('calculateProfitMargin', () => {
  it('이익률을 올바르게 계산한다', () => {
    expect(calculateProfitMargin(10_000_000, 7_000_000)).toBeCloseTo(30.0, 1)
  })

  it('매출이 0이면 0을 반환한다', () => {
    expect(calculateProfitMargin(0, 1_000_000)).toBe(0)
  })

  it('손실 시 음수 이익률을 반환한다', () => {
    expect(calculateProfitMargin(1_000_000, 1_500_000)).toBeCloseTo(-50.0, 1)
  })
})

describe('filterByMonth', () => {
  it('특정 월의 거래만 필터링한다', () => {
    const result = filterByMonth(sampleTransactions, '2025-01')
    expect(result).toHaveLength(4)
    result.forEach((tx) => expect(tx.date.startsWith('2025-01')).toBe(true))
  })

  it('해당 월 거래가 없으면 빈 배열을 반환한다', () => {
    expect(filterByMonth(sampleTransactions, '2025-03')).toHaveLength(0)
  })
})

describe('filterByDateRange', () => {
  it('날짜 범위 내 거래를 필터링한다', () => {
    const result = filterByDateRange(sampleTransactions, '2025-01-10', '2025-01-20')
    expect(result).toHaveLength(2)
  })

  it('시작일과 종료일이 포함된다 (inclusive)', () => {
    const result = filterByDateRange(sampleTransactions, '2025-01-10', '2025-01-10')
    expect(result).toHaveLength(1)
    expect(result[0]?.date).toBe('2025-01-10')
  })
})

describe('calculateChangeRate', () => {
  it('변화율을 올바르게 계산한다', () => {
    expect(calculateChangeRate(120, 100)).toBeCloseTo(20.0, 1)
    expect(calculateChangeRate(80, 100)).toBeCloseTo(-20.0, 1)
  })

  it('이전 값이 0이면 0을 반환한다', () => {
    expect(calculateChangeRate(100, 0)).toBe(0)
  })
})
