import type { Meta, StoryObj } from '@storybook/react'
import BudgetTracker from './BudgetTracker'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'

const meta: Meta<typeof BudgetTracker> = {
  title: '분석 도구/BudgetTracker',
  component: BudgetTracker,
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
type Story = StoryObj<typeof BudgetTracker>

/** 예산이 전혀 설정되지 않은 초기 상태 — 모든 항목이 흐릿하게 표시 */
export const Unset: Story = {
  name: '예산 미설정 상태',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    useSettingsStore.setState({ categoryBudgets: {} })
    return <BudgetTracker />
  },
}

/** 인건비 예산 80% 초과 경고 — 주황 바 표시 */
export const Warning: Story = {
  name: '80% 초과 경고',
  render: () => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${ym}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: 'w1',
          type: 'expense',
          date: today,
          amountKRW: 1_700_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'w2',
          type: 'expense',
          date: today,
          amountKRW: 400_000,
          categoryId: 'expense-rent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    useSettingsStore.setState({
      categoryBudgets: {
        'expense-labor': 2_000_000,
        'expense-rent': 800_000,
      },
    })
    return <BudgetTracker />
  },
  parameters: {
    docs: {
      description: {
        story:
          '인건비 예산 2,000,000원 중 1,700,000원(85%) 사용 시 주황 바와 "한도 근접" 경고가 표시됩니다.',
      },
    },
  },
}

/** 인건비 예산 초과 — 빨간 바 + 초과 금액 표시 */
export const Exceeded: Story = {
  name: '예산 초과',
  render: () => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${ym}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: 'e1',
          type: 'expense',
          date: today,
          amountKRW: 2_500_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'e2',
          type: 'expense',
          date: today,
          amountKRW: 350_000,
          categoryId: 'expense-entertainment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    useSettingsStore.setState({
      categoryBudgets: {
        'expense-labor': 2_000_000,
        'expense-entertainment': 500_000,
      },
    })
    return <BudgetTracker />
  },
  parameters: {
    docs: {
      description: {
        story:
          '인건비 예산 2,000,000원 중 2,500,000원 사용 시 빨간 바와 "500,000원 초과" 메시지가 표시됩니다.',
      },
    },
  },
}
