import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import AnnualTaxTracker from './AnnualTaxTracker'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof AnnualTaxTracker> = {
  title: '세금 계산기/AnnualTaxTracker',
  component: AnnualTaxTracker,
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
type Story = StoryObj<typeof AnnualTaxTracker>

export const Empty: Story = {
  name: '빈 상태 (거래 없음)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useTransactionStore.setState({ transactions: [] })
      }, [])
      return <Story />
    },
  ],
  parameters: {
    docs: {
      description: {
        story: '올해 거래 데이터가 없을 때 표시되는 빈 상태입니다.',
      },
    },
  },
}

export const BracketWarning: Story = {
  name: '세율 구간 상승 경고',
  decorators: [
    (Story) => {
      useEffect(() => {
        const year = new Date().getFullYear()
        useTransactionStore.setState({
          transactions: [
            {
              id: '1',
              date: `${year}-01-15`,
              type: 'income',
              amountKRW: 30000000,
              category: 'sales',
              description: '상품 판매',
            },
            {
              id: '2',
              date: `${year}-02-20`,
              type: 'expense',
              amountKRW: 5000000,
              category: 'cost',
              description: '원자재 구매',
            },
            {
              id: '3',
              date: `${year}-03-10`,
              type: 'income',
              amountKRW: 35000000,
              category: 'sales',
              description: '용역 비용',
            },
            {
              id: '4',
              date: `${year}-04-05`,
              type: 'expense',
              amountKRW: 3000000,
              category: 'cost',
              description: '운영 비용',
            },
          ],
        })
      }, [])
      return <Story />
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          '현재 세율 구간보다 연말 예상 세율 구간이 높아질 때 경고가 표시됩니다. 현재까지 순이익 약 5천2백만 원 기준으로 연말 추정 소득이 더 높아져 세율 구간이 상승할 것으로 예상됩니다.',
      },
    },
  },
}
