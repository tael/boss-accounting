import type { Meta, StoryObj } from '@storybook/react'
import ExpensePieChart from './ExpensePieChart'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof ExpensePieChart> = {
  title: '분석 도구/ExpensePieChart',
  component: ExpensePieChart,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-4 bg-gray-50">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ExpensePieChart>

/** 이번 달 비용 내역 없음 — 빈 상태 안내 메시지 */
export const Empty: Story = {
  name: '빈 상태 (이번 달 비용 없음)',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <ExpensePieChart />
  },
}

/** 5개 카테고리 비용 분포 — 도넛 차트 렌더링 */
export const MultipleCategories: Story = {
  name: '여러 카테고리 비용 분포',
  render: () => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const day = `${ym}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: 'p1',
          type: 'expense',
          date: day,
          amountKRW: 2_500_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'p2',
          type: 'expense',
          date: day,
          amountKRW: 800_000,
          categoryId: 'expense-rent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'p3',
          type: 'expense',
          date: day,
          amountKRW: 450_000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'p4',
          type: 'expense',
          date: day,
          amountKRW: 200_000,
          categoryId: 'expense-entertainment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'p5',
          type: 'expense',
          date: day,
          amountKRW: 150_000,
          categoryId: 'expense-transport',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <ExpensePieChart />
  },
  parameters: {
    docs: {
      description: {
        story:
          '인건비(62%), 임차료(20%), 소모품비(11%), 접대비(5%), 교통비(4%) 5개 카테고리의 이번 달 비용 비중을 도넛 차트로 표시합니다. 총 비용 4,100,000원.',
      },
    },
  },
}
