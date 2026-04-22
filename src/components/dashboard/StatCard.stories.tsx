import type { Meta, StoryObj } from '@storybook/react'
import StatCard from './StatCard'

const meta: Meta<typeof StatCard> = {
  title: 'Dashboard/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  argTypes: {
    format: {
      control: 'select',
      options: ['krw', 'percent', 'count'],
    },
  },
}

export default meta
type Story = StoryObj<typeof StatCard>

export const Revenue: Story = {
  args: {
    title: '이번 달 매출',
    value: 12500000,
    previousValue: 10200000,
    format: 'krw',
    refKey: 'dashboard.revenue',
  },
}

export const Expenses: Story = {
  args: {
    title: '이번 달 비용',
    value: 8300000,
    previousValue: 9100000,
    format: 'krw',
    refKey: 'dashboard.expenses',
  },
}

export const NetProfit: Story = {
  args: {
    title: '순이익',
    value: 4200000,
    previousValue: 1100000,
    format: 'krw',
    refKey: 'dashboard.netProfit',
  },
}

export const ProfitMargin: Story = {
  args: {
    title: '이익률',
    value: 33.6,
    previousValue: 10.8,
    format: 'percent',
    refKey: 'dashboard.profitMargin',
  },
}

export const NewRecord: Story = {
  name: '신규 (전월 0원)',
  args: {
    title: '이번 달 매출',
    value: 5000000,
    previousValue: 0,
    format: 'krw',
  },
}

export const NoComparison: Story = {
  name: '비교 없음',
  args: {
    title: '이번 달 매출',
    value: 12500000,
    format: 'krw',
  },
}

export const NegativeProfit: Story = {
  name: '손실 (마이너스 순이익)',
  args: {
    title: '순이익',
    value: -1200000,
    previousValue: 800000,
    format: 'krw',
    refKey: 'dashboard.netProfit',
  },
}

export const AllCards: Story = {
  name: '4종 카드 그리드',
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 min-h-screen">
      <StatCard
        title="이번 달 매출"
        value={12500000}
        previousValue={10200000}
        format="krw"
        refKey="dashboard.revenue"
      />
      <StatCard
        title="이번 달 비용"
        value={8300000}
        previousValue={9100000}
        format="krw"
        refKey="dashboard.expenses"
      />
      <StatCard
        title="순이익"
        value={4200000}
        previousValue={1100000}
        format="krw"
        refKey="dashboard.netProfit"
      />
      <StatCard
        title="이익률"
        value={33.6}
        previousValue={10.8}
        format="percent"
        refKey="dashboard.profitMargin"
      />
    </div>
  ),
}
