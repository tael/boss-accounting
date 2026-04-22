import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import CashFlowChart from './CashFlowChart'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof CashFlowChart> = {
  title: '재무제표/CashFlowChart',
  component: CashFlowChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CashFlowChart>

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

/** 현재 기준 N개월 전 YYYY-MM-DD 생성 */
function dateOfMonthsAgo(monthsAgo: number, day = 15): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

export const SixMonthsData: Story = {
  name: '6개월 현금흐름 데이터',
  decorators: [
    (Story) => {
      useEffect(() => {
        useTransactionStore.setState({
          transactions: [
            // 5개월 전
            makeTx({ type: 'income', amountKRW: 8_000_000, date: dateOfMonthsAgo(5, 10) }),
            makeTx({ type: 'expense', amountKRW: 6_000_000, date: dateOfMonthsAgo(5, 20) }),
            // 4개월 전
            makeTx({ type: 'income', amountKRW: 10_000_000, date: dateOfMonthsAgo(4, 10) }),
            makeTx({ type: 'expense', amountKRW: 5_500_000, date: dateOfMonthsAgo(4, 20) }),
            // 3개월 전
            makeTx({ type: 'income', amountKRW: 12_000_000, date: dateOfMonthsAgo(3, 10) }),
            makeTx({ type: 'expense', amountKRW: 7_000_000, date: dateOfMonthsAgo(3, 20) }),
            // 2개월 전
            makeTx({ type: 'income', amountKRW: 9_000_000, date: dateOfMonthsAgo(2, 10) }),
            makeTx({ type: 'expense', amountKRW: 9_500_000, date: dateOfMonthsAgo(2, 20) }),
            // 1개월 전
            makeTx({ type: 'income', amountKRW: 15_000_000, date: dateOfMonthsAgo(1, 10) }),
            makeTx({ type: 'expense', amountKRW: 6_000_000, date: dateOfMonthsAgo(1, 20) }),
            // 이번 달
            makeTx({ type: 'income', amountKRW: 18_000_000, date: dateOfMonthsAgo(0, 10) }),
            makeTx({ type: 'expense', amountKRW: 7_000_000, date: dateOfMonthsAgo(0, 18) }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
