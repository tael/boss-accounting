import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import RecurringList from './RecurringList'
import { useRecurringStore } from '@/stores/recurringStore'

const meta: Meta<typeof RecurringList> = {
  title: '거래 관리/RecurringList',
  component: RecurringList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof RecurringList>

export const Empty: Story = {
  name: '템플릿 없음 (빈 상태)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useRecurringStore.setState({ templates: [] })
      }, [])
      return <Story />
    },
  ],
}

export const WithTemplates: Story = {
  name: '반복 거래 템플릿 목록',
  decorators: [
    (Story) => {
      useEffect(() => {
        useRecurringStore.setState({
          templates: [
            {
              id: 'tpl-001',
              dayOfMonth: 5,
              type: 'expense',
              amountKRW: 850000,
              categoryId: 'expense-rent',
              memo: '사무실 임차료',
              isVatDeductible: true,
              enabled: true,
              lastAppliedMonth: '2026-04',
            },
            {
              id: 'tpl-002',
              dayOfMonth: 25,
              type: 'expense',
              amountKRW: 55000,
              categoryId: 'expense-communication',
              memo: '인터넷 요금',
              isVatDeductible: true,
              enabled: true,
            },
            {
              id: 'tpl-003',
              dayOfMonth: 10,
              type: 'income',
              amountKRW: 2000000,
              categoryId: 'income-service',
              memo: '월 정기 용역',
              enabled: false,
            },
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
