import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import IncomeTaxCalc from './IncomeTaxCalc'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof IncomeTaxCalc> = {
  title: '세금 계산기/IncomeTaxCalc',
  component: IncomeTaxCalc,
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
type Story = StoryObj<typeof IncomeTaxCalc>

export const Default: Story = {
  name: '기본 상태',
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
              amountKRW: 50000000,
              category: 'sales',
              description: '상품 판매',
            },
            {
              id: '2',
              date: `${year}-02-20`,
              type: 'expense',
              amountKRW: 15000000,
              category: 'cost',
              description: '원자재 구매',
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
          '올해 거래 데이터(매출 5천만 원, 비용 1천5백만 원)를 기반으로 자동 계산 모드가 활성화된 상태입니다. 과세표준 3천5백만 원으로 세액이 자동 계산됩니다.',
      },
    },
  },
}
