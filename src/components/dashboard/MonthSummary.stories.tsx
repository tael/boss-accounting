import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import MonthSummary from './MonthSummary'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof MonthSummary> = {
  title: 'Dashboard/MonthSummary',
  component: MonthSummary,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MonthSummary>

// MonthSummary는 getCurrentYearMonth()로 현재 달을 직접 계산하므로
// store에 현재 달 기준 데이터를 주입해야 StatCard 값이 반영됨

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function prevYearMonth(): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

function makeTx(
  yearMonth: string,
  day: number,
  overrides: Partial<Transaction>,
): Transaction {
  const now = new Date().toISOString()
  const d = String(day).padStart(2, '0')
  return {
    id: makeId(),
    type: 'income',
    date: `${yearMonth}-${d}`,
    amountKRW: 0,
    categoryId: 'income-service',
    isVatDeductible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

// --- 스토리 ---

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

export const HighRevenue: Story = {
  name: '매출 높은 달',
  decorators: [
    (Story) => {
      useEffect(() => {
        const cur = currentYearMonth()
        const prev = prevYearMonth()
        useTransactionStore.setState({
          transactions: [
            // 이번 달: 매출 2000만, 비용 800만 → 순이익 1200만, 이익률 60%
            makeTx(cur, 5, { type: 'income', amountKRW: 20_000_000, categoryId: 'income-service' }),
            makeTx(cur, 10, { type: 'expense', amountKRW: 5_000_000, categoryId: 'expense-labor' }),
            makeTx(cur, 15, { type: 'expense', amountKRW: 3_000_000, categoryId: 'expense-rent' }),
            // 전월: 매출 1500만, 비용 900만
            makeTx(prev, 5, { type: 'income', amountKRW: 15_000_000, categoryId: 'income-service' }),
            makeTx(prev, 10, { type: 'expense', amountKRW: 6_000_000, categoryId: 'expense-labor' }),
            makeTx(prev, 15, { type: 'expense', amountKRW: 3_000_000, categoryId: 'expense-rent' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}

export const DeficitMonth: Story = {
  name: '적자 달 (비용 > 매출)',
  decorators: [
    (Story) => {
      useEffect(() => {
        const cur = currentYearMonth()
        const prev = prevYearMonth()
        useTransactionStore.setState({
          transactions: [
            // 이번 달: 매출 300만, 비용 800만 → 순이익 -500만 (적자)
            makeTx(cur, 5, { type: 'income', amountKRW: 3_000_000, categoryId: 'income-service' }),
            makeTx(cur, 10, { type: 'expense', amountKRW: 5_000_000, categoryId: 'expense-labor' }),
            makeTx(cur, 15, { type: 'expense', amountKRW: 3_000_000, categoryId: 'expense-rent' }),
            // 전월: 매출 800만, 비용 500만 (흑자였던 전월과 대비)
            makeTx(prev, 5, { type: 'income', amountKRW: 8_000_000, categoryId: 'income-service' }),
            makeTx(prev, 10, { type: 'expense', amountKRW: 3_000_000, categoryId: 'expense-labor' }),
            makeTx(prev, 15, { type: 'expense', amountKRW: 2_000_000, categoryId: 'expense-rent' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
