import type { Meta, StoryObj } from '@storybook/react'
import WhatIfSimulator from './WhatIfSimulator'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof WhatIfSimulator> = {
  title: '분석 도구/WhatIfSimulator',
  component: WhatIfSimulator,
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
type Story = StoryObj<typeof WhatIfSimulator>

/** 거래 없음 — 기준값 모두 0, 매출 데이터 없음 안내 */
export const Default: Story = {
  name: '기본 상태 (데이터 없음)',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <WhatIfSimulator />
  },
}

/** 직원 1명 추가(+180만원) 프리셋 적용 시 새로운 BEP 및 달성 가능 여부 표시 */
export const AddEmployee: Story = {
  name: '직원 1명 추가 시나리오',
  render: () => {
    const now = new Date()
    const transactions = []

    // 최근 3개월 데이터 생성
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 15)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const day = `${ym}-15`

      transactions.push(
        {
          id: `wi-inc-${i}`,
          type: 'income' as const,
          date: day,
          amountKRW: 6_000_000,
          categoryId: 'income-service',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `wi-labor-${i}`,
          type: 'expense' as const,
          date: day,
          amountKRW: 2_000_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `wi-rent-${i}`,
          type: 'expense' as const,
          date: day,
          amountKRW: 500_000,
          categoryId: 'expense-rent',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `wi-var-${i}`,
          type: 'expense' as const,
          date: day,
          amountKRW: 800_000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      )
    }

    useTransactionStore.setState({ transactions })
    return <WhatIfSimulator />
  },
  parameters: {
    docs: {
      description: {
        story:
          '월 평균 매출 6,000,000원, 고정비 2,500,000원, 변동비 800,000원 기준. "직원 1명 추가 (+180만원)" 프리셋 버튼을 클릭하면 새로운 BEP와 달성 가능 여부가 업데이트됩니다.',
      },
    },
  },
}
