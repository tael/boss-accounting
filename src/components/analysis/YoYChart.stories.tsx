import type { Meta, StoryObj } from '@storybook/react'
import YoYChart from './YoYChart'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof YoYChart> = {
  title: '분석 도구/YoYChart',
  component: YoYChart,
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
type Story = StoryObj<typeof YoYChart>

/** 전년 데이터 없음 — "1년 이상 데이터가 쌓이면" 안내 메시지 */
export const NoData: Story = {
  name: '데이터 없음 (1년 미만)',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <YoYChart />
  },
}

/** 올해 + 전년 동월 매출 데이터 — 바 차트로 비교 표시 */
export const WithYoYData: Story = {
  name: '1년치 전년 동기 비교',
  render: () => {
    const now = new Date()
    const transactions = []

    // 올해 1월부터 현재 월까지
    for (let m = 1; m <= now.getMonth() + 1; m++) {
      const ym = `${now.getFullYear()}-${String(m).padStart(2, '0')}`
      const day = `${ym}-15`
      const revenue = 4_000_000 + m * 100_000

      transactions.push({
        id: `yoy-this-${m}`,
        type: 'income' as const,
        date: day,
        amountKRW: revenue,
        categoryId: 'income-service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // 전년 1월부터 12월까지
    for (let m = 1; m <= 12; m++) {
      const ym = `${now.getFullYear() - 1}-${String(m).padStart(2, '0')}`
      const day = `${ym}-15`
      const revenue = 3_000_000 + m * 80_000

      transactions.push({
        id: `yoy-last-${m}`,
        type: 'income' as const,
        date: day,
        amountKRW: revenue,
        categoryId: 'income-service',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({ transactions })
    return <YoYChart />
  },
  parameters: {
    docs: {
      description: {
        story:
          '올해 매출은 4,100,000원에서 시작해 월마다 100,000원씩 증가, 전년은 3,080,000원에서 시작해 80,000원씩 증가하는 패턴으로 전년 대비 성장 추이를 확인할 수 있습니다.',
      },
    },
  },
}
