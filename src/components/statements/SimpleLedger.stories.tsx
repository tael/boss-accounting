import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import SimpleLedger from './SimpleLedger'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof SimpleLedger> = {
  title: '재무제표/SimpleLedger',
  component: SimpleLedger,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SimpleLedger>

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

function makeTx(overrides: Partial<Transaction>): Transaction {
  const now = new Date().toISOString()
  return {
    id: makeId(),
    type: 'income',
    date: '2026-04-01',
    amountKRW: 0,
    categoryId: 'income-service',
    isVatDeductible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function currentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export const EmptyState: Story = {
  name: '빈 상태 (거래 없음)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useTransactionStore.setState({ transactions: [] })
      }, [])
      return <Story />
    },
  ],
}

export const ThisMonthData: Story = {
  name: '이번 달 데이터',
  decorators: [
    (Story) => {
      useEffect(() => {
        const ym = currentYearMonth()
        useTransactionStore.setState({
          transactions: [
            makeTx({ type: 'income', amountKRW: 5_000_000, categoryId: 'income-service', date: `${ym}-03`, memo: '웹사이트 개발 1차 대금' }),
            makeTx({ type: 'expense', amountKRW: 1_500_000, categoryId: 'expense-rent', date: `${ym}-05`, memo: '사무실 임차료' }),
            makeTx({ type: 'income', amountKRW: 8_000_000, categoryId: 'income-service', date: `${ym}-10`, memo: '앱 유지보수 계약금' }),
            makeTx({ type: 'expense', amountKRW: 300_000, categoryId: 'expense-supplies', date: `${ym}-11`, memo: '사무용품 구매' }),
            makeTx({ type: 'expense', amountKRW: 4_000_000, categoryId: 'expense-labor', date: `${ym}-15`, memo: '외주 디자이너 용역비' }),
            makeTx({ type: 'income', amountKRW: 3_500_000, categoryId: 'income-product', date: `${ym}-18`, memo: '솔루션 라이선스 판매' }),
            makeTx({ type: 'expense', amountKRW: 150_000, categoryId: 'expense-misc', date: `${ym}-20`, memo: '클라우드 서버 비용' }),
            makeTx({ type: 'expense', amountKRW: 500_000, categoryId: 'expense-marketing', date: `${ym}-22`, memo: '온라인 광고비' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
