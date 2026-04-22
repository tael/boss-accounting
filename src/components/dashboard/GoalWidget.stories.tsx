import type { Meta, StoryObj } from '@storybook/react'
import GoalWidget from './GoalWidget'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'

const meta: Meta<typeof GoalWidget> = {
  title: 'Dashboard/GoalWidget',
  component: GoalWidget,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      // 각 스토리마다 스토어를 초기화해서 상호간섭 방지
      return <Story />
    },
  ],
}

export default meta
type Story = StoryObj<typeof GoalWidget>

/** 목표가 설정되지 않은 상태 */
export const GoalNotSet: Story = {
  render: () => {
    useSettingsStore.setState({
      monthlyProfitGoalKRW: 0,
    })
    useTransactionStore.setState({
      transactions: [],
    })
    return <GoalWidget />
  },
}

/** 목표 50% 달성 */
export const HalfAchieved: Story = {
  render: () => {
    useSettingsStore.setState({
      monthlyProfitGoalKRW: 5000000,
    })

    // 현재월을 기준으로 순이익 약 2,500,000원이 되도록 설정
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${currentMonth}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income',
          date: today,
          amountKRW: 5000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'expense',
          date: today,
          amountKRW: 2500000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <GoalWidget />
  },
}

/** 목표 100% 초과 달성 (축하) */
export const FullyAchieved: Story = {
  render: () => {
    useSettingsStore.setState({
      monthlyProfitGoalKRW: 5000000,
    })

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${currentMonth}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income',
          date: today,
          amountKRW: 8000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'expense',
          date: today,
          amountKRW: 2000000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <GoalWidget />
  },
}

/** 목표 초과 달성 (125%) */
export const OverAchieved: Story = {
  name: '125% 초과 달성',
  render: () => {
    useSettingsStore.setState({
      monthlyProfitGoalKRW: 4000000,
    })

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${currentMonth}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income',
          date: today,
          amountKRW: 10000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'expense',
          date: today,
          amountKRW: 5000000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <GoalWidget />
  },
}
