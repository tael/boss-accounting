import type { Meta, StoryObj } from '@storybook/react'
import ExpenseComparisonChart from './ExpenseComparisonChart'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof ExpenseComparisonChart> = {
  title: '분석 도구/ExpenseComparisonChart',
  component: ExpenseComparisonChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl p-4 bg-gray-50">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ExpenseComparisonChart>

/** 거래 데이터 없음 — 빈 상태 안내 메시지 표시 */
export const Empty: Story = {
  name: '빈 상태 (데이터 없음)',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <ExpenseComparisonChart />
  },
}

/** 이번 달 소모품비가 전월 대비 +20% 이상 증가 — 빨간 바로 강조 */
export const WithIncreasedItems: Story = {
  name: '증가 항목 강조 (변화율 +20% 이상)',
  render: () => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth() + 1
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1
    const lastYear = thisMonth === 1 ? thisYear - 1 : thisYear

    const thisYM = `${thisYear}-${String(thisMonth).padStart(2, '0')}`
    const lastYM = `${lastYear}-${String(lastMonth).padStart(2, '0')}`

    useTransactionStore.setState({
      transactions: [
        // 이번 달 — 소모품비 크게 증가
        {
          id: 't1',
          type: 'expense',
          date: `${thisYM}-10`,
          amountKRW: 1_500_000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // 이번 달 — 인건비 소폭 증가
        {
          id: 't2',
          type: 'expense',
          date: `${thisYM}-10`,
          amountKRW: 2_200_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // 지난 달 — 소모품비
        {
          id: 't3',
          type: 'expense',
          date: `${lastYM}-10`,
          amountKRW: 800_000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // 지난 달 — 인건비
        {
          id: 't4',
          type: 'expense',
          date: `${lastYM}-10`,
          amountKRW: 2_000_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <ExpenseComparisonChart />
  },
  parameters: {
    docs: {
      description: {
        story:
          '소모품비가 전월 800,000원에서 이번 달 1,500,000원으로 87.5% 증가해 빨간 바로 강조 표시됩니다. 인건비는 10% 증가로 파란 바로 표시됩니다.',
      },
    },
  },
}
