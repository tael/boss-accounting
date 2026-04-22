import type { Meta, StoryObj } from '@storybook/react'
import BreakEvenCalc from './BreakEvenCalc'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof BreakEvenCalc> = {
  title: '분석 도구/BreakEvenCalc',
  component: BreakEvenCalc,
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
type Story = StoryObj<typeof BreakEvenCalc>

/** 거래 데이터 없음 — 자동 불러오기 버튼 비활성화 상태 */
export const Empty: Story = {
  name: '빈 상태 (거래 없음)',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <BreakEvenCalc />
  },
}

/** 고정비 2,000,000원 / 변동비 500,000원 입력 시 BEP 계산 결과 표시 */
export const Calculable: Story = {
  name: '계산 가능 — BEP 결과 표시',
  render: () => {
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${ym}-15`
    useTransactionStore.setState({
      transactions: [
        {
          id: 'c1',
          type: 'expense',
          date: today,
          amountKRW: 2_000_000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'c2',
          type: 'expense',
          date: today,
          amountKRW: 500_000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'c3',
          type: 'income',
          date: today,
          amountKRW: 5_000_000,
          categoryId: 'income-service',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <BreakEvenCalc />
  },
  parameters: {
    docs: {
      description: {
        story:
          '고정비 2,000,000원, 변동비 500,000원 입력 시 손익분기 매출액과 변동비율이 파란 배경으로 표시됩니다.',
      },
    },
  },
}

/** 변동비율 >= 100% — BEP 달성 불가 상태 (주황 배경) */
export const Infeasible: Story = {
  name: '달성 불가 — 변동비율 초과',
  render: () => {
    useTransactionStore.setState({ transactions: [] })
    return <BreakEvenCalc />
  },
  parameters: {
    docs: {
      description: {
        story:
          '변동비가 매출을 초과하는 구조(변동비율 >= 100%)로 입력하면 "현재 비용 구조로는 BEP 달성 불가" 메시지가 주황 배경으로 표시됩니다. 스토리에서는 입력 필드에 고정비 1,000,000원, 변동비 10,000,000원을 직접 입력해 확인하세요.',
      },
    },
  },
}
