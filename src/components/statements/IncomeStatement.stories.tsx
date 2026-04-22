import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import IncomeStatement from './IncomeStatement'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof IncomeStatement> = {
  title: '재무제표/IncomeStatement',
  component: IncomeStatement,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof IncomeStatement>

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

function makeTx(overrides: Partial<Transaction>): Transaction {
  const now = new Date().toISOString()
  return {
    id: makeId(),
    type: 'income',
    date: '2026-04-01',
    amountKRW: 0,
    categoryId: 'income-service',
    isVatDeductible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** 현재 분기의 각 월 YYYY-MM 목록 반환 */
function currentQuarterMonths(): string[] {
  const now = new Date()
  const m = now.getMonth() + 1
  const q = Math.ceil(m / 3)
  const startMonth = (q - 1) * 3 + 1
  return [0, 1, 2].map((i) => {
    const month = startMonth + i
    return `${now.getFullYear()}-${String(month).padStart(2, '0')}`
  })
}

export const EmptyState: Story = {
  name: '빈 상태 (거래 없음)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useTransactionStore.setState({ transactions: [] })
      }, [])
      return <Story />
    },
  ],
}

export const MonthlyProfit: Story = {
  name: '월별 손익 (이번 달)',
  decorators: [
    (Story) => {
      useEffect(() => {
        const ym = currentYearMonth()
        useTransactionStore.setState({
          transactions: [
            makeTx({ type: 'income', amountKRW: 12_000_000, categoryId: 'income-service', date: `${ym}-05` }),
            makeTx({ type: 'income', amountKRW: 3_000_000, categoryId: 'income-product', date: `${ym}-12` }),
            makeTx({ type: 'expense', amountKRW: 4_000_000, categoryId: 'expense-labor', date: `${ym}-01` }),
            makeTx({ type: 'expense', amountKRW: 1_500_000, categoryId: 'expense-rent', date: `${ym}-01` }),
            makeTx({ type: 'expense', amountKRW: 800_000, categoryId: 'expense-supplies', date: `${ym}-10` }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}

export const QuarterlyProfit: Story = {
  name: '분기별 손익 (이번 분기)',
  decorators: [
    (Story) => {
      useEffect(() => {
        const months = currentQuarterMonths()
        useTransactionStore.setState({
          transactions: [
            // 분기 1개월차
            makeTx({ type: 'income', amountKRW: 10_000_000, categoryId: 'income-service', date: `${months[0]}-10` }),
            makeTx({ type: 'expense', amountKRW: 4_000_000, categoryId: 'expense-labor', date: `${months[0]}-25` }),
            // 분기 2개월차
            makeTx({ type: 'income', amountKRW: 13_000_000, categoryId: 'income-service', date: `${months[1]}-08` }),
            makeTx({ type: 'income', amountKRW: 2_000_000, categoryId: 'income-product', date: `${months[1]}-15` }),
            makeTx({ type: 'expense', amountKRW: 5_000_000, categoryId: 'expense-labor', date: `${months[1]}-25` }),
            makeTx({ type: 'expense', amountKRW: 1_500_000, categoryId: 'expense-rent', date: `${months[1]}-01` }),
            // 분기 3개월차 (현재 달)
            makeTx({ type: 'income', amountKRW: 15_000_000, categoryId: 'income-service', date: `${months[2]}-07` }),
            makeTx({ type: 'expense', amountKRW: 6_000_000, categoryId: 'expense-labor', date: `${months[2]}-25` }),
            makeTx({ type: 'expense', amountKRW: 1_000_000, categoryId: 'expense-supplies', date: `${months[2]}-10` }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
