import type { Meta, StoryObj } from '@storybook/react'
import HealthScoreWidget from './HealthScoreWidget'
import { useTransactionStore } from '@/stores/transactionStore'

const meta: Meta<typeof HealthScoreWidget> = {
  title: 'Dashboard/HealthScoreWidget',
  component: HealthScoreWidget,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof HealthScoreWidget>

/** 데이터 없음 상태 */
export const NoData: Story = {
  render: () => {
    useTransactionStore.setState({
      transactions: [],
    })
    return <HealthScoreWidget />
  },
}

/** 위험 점수 (20점) - Danger */
export const DangerScore: Story = {
  name: '위험 (20점)',
  render: () => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const today = `${currentMonth}-15`

    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income' as const,
          date: today,
          amountKRW: 1000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'expense' as const,
          date: today,
          amountKRW: 900000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // 지난 2개월 손실
        {
          id: '3',
          type: 'income' as const,
          date: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-10`,
          amountKRW: 500000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          type: 'expense' as const,
          date: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-10`,
          amountKRW: 600000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <HealthScoreWidget />
  },
}

/** 보통 점수 (60점) - Good */
export const GoodScore: Story = {
  name: '양호 (60점)',
  render: () => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // 매출 5000만원, 비용 3000만원 → 이익률 40%
    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income' as const,
          date: `${currentMonth}-05`,
          amountKRW: 3000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'income' as const,
          date: `${currentMonth}-15`,
          amountKRW: 2000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'expense' as const,
          date: `${currentMonth}-10`,
          amountKRW: 2000000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          type: 'expense' as const,
          date: `${currentMonth}-20`,
          amountKRW: 1000000,
          categoryId: 'expense-labor',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // 지난 3개월 중 2개월 흑자
        {
          id: '5',
          type: 'income' as const,
          date: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-10`,
          amountKRW: 3000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '6',
          type: 'expense' as const,
          date: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-15`,
          amountKRW: 1500000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <HealthScoreWidget />
  },
}

/** 우수 점수 (90점) - Excellent */
export const ExcellentScore: Story = {
  name: '우수 (90점)',
  render: () => {
    const now = new Date()

    // 지난 4개월 거래 생성
    const transactions = []
    for (let month = 0; month < 4; month++) {
      const d = new Date()
      d.setMonth(d.getMonth() - month)
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      // 각 달: 매출 1000만원, 비용 3000만원 → 70% 이익률
      transactions.push({
        id: `income-${month}`,
        type: 'income' as const,
        date: `${monthStr}-05`,
        amountKRW: 10000000,
        categoryId: 'income-sales',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      transactions.push({
        id: `expense-${month}`,
        type: 'expense' as const,
        date: `${monthStr}-10`,
        amountKRW: 3000000,
        categoryId: 'expense-supplies',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({
      transactions,
    })
    return <HealthScoreWidget />
  },
}

/** 저이익률 (경고) */
export const LowProfitMargin: Story = {
  name: '낮은 이익률 경고 (8점)',
  render: () => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // 매출 1000만원, 비용 920만원 → 8% 이익률 (위험)
    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income' as const,
          date: `${currentMonth}-05`,
          amountKRW: 10000000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'expense' as const,
          date: `${currentMonth}-10`,
          amountKRW: 9200000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <HealthScoreWidget />
  },
}

/** 매출 증가 추세 */
export const GrowingRevenue: Story = {
  name: '매출 증가 추세 (80점)',
  render: () => {
    const transactions = []

    // 4개월 데이터: 점진적 증가
    for (let month = 0; month < 4; month++) {
      const d = new Date()
      d.setMonth(d.getMonth() - month)
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

      // 이전달에서 증가: 500만원 → 1000만원 → 1500만원 → 2000만원
      const revenue = (4 - month) * 500000
      const expense = revenue * 0.3 // 30% 비용

      transactions.push({
        id: `income-${month}`,
        type: 'income' as const,
        date: `${monthStr}-05`,
        amountKRW: revenue,
        categoryId: 'income-sales',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      transactions.push({
        id: `expense-${month}`,
        type: 'expense' as const,
        date: `${monthStr}-10`,
        amountKRW: Math.round(expense),
        categoryId: 'expense-supplies',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({
      transactions,
    })
    return <HealthScoreWidget />
  },
}
