import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import InsightCard from './InsightCard'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types/transaction'

const meta: Meta<typeof InsightCard> = {
  title: 'Dashboard/InsightCard',
  component: InsightCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InsightCard>

// 현재 달 기준 날짜 생성 헬퍼 (generateInsights가 thisMonth 기준으로 필터링하므로 필수)
function thisMonthDate(day: number): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function makeId(): string {
  return Math.random().toString(36).slice(2)
}

function makeTx(overrides: Partial<Transaction>): Transaction {
  const now = new Date().toISOString()
  return {
    id: makeId(),
    type: 'income',
    date: thisMonthDate(1),
    amountKRW: 0,
    categoryId: 'income-service',
    isVatDeductible: true,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

// --- 스토리 ---

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
}

export const WarningHighLabor: Story = {
  name: '경고 인사이트 (인건비 높음)',
  decorators: [
    (Story) => {
      useEffect(() => {
        // 매출 1000만, 인건비 500만 → 인건비 비율 50% → 경고
        useTransactionStore.setState({
          transactions: [
            makeTx({ type: 'income', amountKRW: 10_000_000, categoryId: 'income-service' }),
            makeTx({ type: 'expense', amountKRW: 5_000_000, categoryId: 'expense-labor' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}

export const SuccessGoodMargin: Story = {
  name: '성공 인사이트 (이익률 좋음)',
  decorators: [
    (Story) => {
      useEffect(() => {
        // 매출 1000만, 비용 600만 → 이익률 40% → success
        useTransactionStore.setState({
          transactions: [
            makeTx({ type: 'income', amountKRW: 10_000_000, categoryId: 'income-service' }),
            makeTx({ type: 'expense', amountKRW: 6_000_000, categoryId: 'expense-other' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}

export const MultipleInsightsWithMore: Story = {
  name: '여러 인사이트 (더보기 버튼 포함)',
  decorators: [
    (Story) => {
      useEffect(() => {
        // 인건비 높음 + 이익률 낮음 + 3개월 연속 매출 증가 → 인사이트 3개 이상
        const now = new Date()

        // 3개월치 매출 증가 데이터 (cashFlow 계산용)
        function dateOf(monthOffset: number, day: number): string {
          const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, day)
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          return `${y}-${m}-${String(day).padStart(2, '0')}`
        }

        useTransactionStore.setState({
          transactions: [
            // 2개월 전 매출 500만
            makeTx({ date: dateOf(-2, 10), type: 'income', amountKRW: 5_000_000, categoryId: 'income-service' }),
            // 1개월 전 매출 700만
            makeTx({ date: dateOf(-1, 10), type: 'income', amountKRW: 7_000_000, categoryId: 'income-service' }),
            // 이번 달 매출 1000만
            makeTx({ date: dateOf(0, 10), type: 'income', amountKRW: 10_000_000, categoryId: 'income-service' }),
            // 이번 달 인건비 500만 (비율 50% → 경고)
            makeTx({ date: dateOf(0, 10), type: 'expense', amountKRW: 5_000_000, categoryId: 'expense-labor' }),
            // 이번 달 기타비용 400만 (이익률 10% → 경고)
            makeTx({ date: dateOf(0, 10), type: 'expense', amountKRW: 4_000_000, categoryId: 'expense-other' }),
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
