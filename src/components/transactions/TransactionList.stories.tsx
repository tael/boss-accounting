import type { Meta, StoryObj } from '@storybook/react'
import TransactionList from './TransactionList'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof TransactionList> = {
  title: '거래 관리/TransactionList',
  component: TransactionList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof TransactionList>

const sampleTransactions: Transaction[] = [
  {
    id: 'tx-001',
    type: 'income',
    date: '2026-04-20',
    amountKRW: 3500000,
    categoryId: 'income-service',
    memo: '4월 용역 대금',
    createdAt: '2026-04-20T09:00:00Z',
    updatedAt: '2026-04-20T09:00:00Z',
  },
  {
    id: 'tx-002',
    type: 'expense',
    date: '2026-04-18',
    amountKRW: 850000,
    categoryId: 'expense-rent',
    memo: '사무실 임차료',
    isVatDeductible: true,
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-04-18T10:00:00Z',
  },
  {
    id: 'tx-003',
    type: 'expense',
    date: '2026-04-15',
    amountKRW: 45000,
    categoryId: 'expense-transport',
    memo: undefined,
    isVatDeductible: false,
    createdAt: '2026-04-15T14:30:00Z',
    updatedAt: '2026-04-15T14:30:00Z',
  },
  {
    id: 'tx-004',
    type: 'income',
    date: '2026-04-10',
    amountKRW: 1200000,
    categoryId: 'income-goods',
    memo: '상품 판매',
    createdAt: '2026-04-10T11:00:00Z',
    updatedAt: '2026-04-10T11:00:00Z',
  },
]

export const WithTransactions: Story = {
  name: '거래 목록',
  args: {
    transactions: sampleTransactions,
  },
}

export const Empty: Story = {
  name: '거래 없음 (빈 상태)',
  args: {
    transactions: [],
  },
}

export const SingleTransaction: Story = {
  name: '거래 1건',
  args: {
    transactions: [sampleTransactions[0]!],
  },
}
