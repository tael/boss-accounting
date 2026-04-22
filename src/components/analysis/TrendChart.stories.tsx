import type { Meta, StoryObj } from '@storybook/react'
import TrendChart from './TrendChart'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof TrendChart> = {
  title: '분석 도구/TrendChart',
  component: TrendChart,
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
type Story = StoryObj<typeof TrendChart>

/** 거래 없음 — 모든 월 값이 0인 빈 라인 차트 */
export const Empty: Story = {
  name: '빈 상태 (거래 없음)',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <TrendChart />
  },
}

/** 최근 12개월 매출/비용/이익 추이 데이터 */
export const TwelveMonths: Story = {
  name: '12개월 데이터',
  render: () => {
    const now = new Date()
    const transactions = []

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const day = `${ym}-15`

      // 매출: 4,000,000원 기준으로 월마다 소폭 변동
      const revenue = 4_000_000 + (i % 3) * 500_000
      // 비용: 2,500,000원 기준 고정비 + 변동비
      const expense = 2_000_000 + (i % 4) * 200_000

      transactions.push(
        {
          id: `tr-inc-${i}`,
          type: 'income' as const,
          date: day,
          amountKRW: revenue,
          categoryId: 'income-service',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `tr-exp-${i}`,
          type: 'expense' as const,
          date: day,
          amountKRW: expense,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      )
    }

    useTransactionStore.setState({ transactions })
    return <TrendChart />
  },
  parameters: {
    docs: {
      description: {
        story:
          '최근 12개월 동안 매출 4,000,000원 내외, 비용 2,000,000원 내외로 이익이 꾸준히 플러스인 추이를 라인 차트로 표시합니다.',
      },
    },
  },
}
