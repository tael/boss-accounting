import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import BalanceSnapshot from './BalanceSnapshot'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof BalanceSnapshot> = {
  title: '재무제표/BalanceSnapshot',
  component: BalanceSnapshot,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BalanceSnapshot>

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

function makeTx(overrides: Partial<Transaction>): Transaction {
  const now = new Date().toISOString()
  return {
    id: makeId(),
    type: 'income',
    date: '2026-04-10',
    amountKRW: 0,
    categoryId: 'income-service',
    isVatDeductible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
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

export const WithAssets: Story = {
  name: '자산 있음 (매출 3000만, 비용 1200만)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useTransactionStore.setState({
          transactions: [
            makeTx({ type: 'income', amountKRW: 20_000_000, categoryId: 'income-service', date: '2026-03-05' }),
            makeTx({ type: 'income', amountKRW: 10_000_000, categoryId: 'income-product', date: '2026-04-12' }),
            makeTx({ type: 'expense', amountKRW: 5_000_000, categoryId: 'expense-labor', date: '2026-03-25' }),
            makeTx({ type: 'expense', amountKRW: 3_000_000, categoryId: 'expense-rent', date: '2026-04-01' }),
            makeTx({ type: 'expense', amountKRW: 2_000_000, categoryId: 'expense-supplies', date: '2026-04-10' }),
            makeTx({ type: 'expense', amountKRW: 2_000_000, categoryId: 'expense-misc', date: '2026-04-15' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
