import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import TransactionFilter from './TransactionFilter'
import type { TransactionFilter as FilterState } from '@/types/transaction'

const meta: Meta<typeof TransactionFilter> = {
  title: '거래 관리/TransactionFilter',
  component: TransactionFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TransactionFilter>

export const Default: Story = {
  name: '기본 (필터 없음)',
  render: () => {
    const [filter, setFilter] = useState<FilterState>({})
    return <TransactionFilter filter={filter} onChange={setFilter} />
  },
}

export const WithActiveFilters: Story = {
  name: '필터 적용 상태',
  render: () => {
    const [filter, setFilter] = useState<FilterState>({
      type: 'expense',
      dateFrom: '2026-04-01',
      dateTo: '2026-04-30',
      categoryId: 'expense-rent',
      amountMin: 100000,
      amountMax: 1000000,
      memoSearch: '임차료',
    })
    return <TransactionFilter filter={filter} onChange={setFilter} />
  },
}

export const IncomeOnly: Story = {
  name: '매출만 필터',
  render: () => {
    const [filter, setFilter] = useState<FilterState>({ type: 'income' })
    return <TransactionFilter filter={filter} onChange={setFilter} />
  },
}
