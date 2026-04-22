import type { Meta, StoryObj } from '@storybook/react'
import StreakBadge from './StreakBadge'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { getTodayLocal } from '@/utils/format'

const meta: Meta<typeof StreakBadge> = {
  title: 'Dashboard/StreakBadge',
  component: StreakBadge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof StreakBadge>

/** 스트릭 0일 (오늘 미기록) */
export const NoStreak: Story = {
  render: () => {
    useSettingsStore.setState({
      currentStreak: 0,
      maxStreak: 0,
      lastEntryDate: '',
    })
    useTransactionStore.setState({
      transactions: [],
    })
    return <StreakBadge />
  },
}

/** 스트릭 7일 (골드 상태) */
export const SevenDayStreak: Story = {
  name: '7일 연속 (골드)',
  render: () => {
    const today = getTodayLocal()

    useSettingsStore.setState({
      currentStreak: 7,
      maxStreak: 7,
      lastEntryDate: today,
    })

    // 7일치 거래 데이터 생성
    const transactions = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]!

      transactions.push({
        id: `tx-${i}`,
        type: 'income' as const,
        date: dateStr,
        amountKRW: 100000,
        categoryId: 'income-sales',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({
      transactions,
    })
    return <StreakBadge />
  },
}

/** 스트릭 30일 (최장 기록) */
export const ThirtyDayStreak: Story = {
  name: '30일 연속 (최장 기록)',
  render: () => {
    const today = getTodayLocal()

    useSettingsStore.setState({
      currentStreak: 30,
      maxStreak: 30,
      lastEntryDate: today,
    })

    // 30일치 거래 데이터 생성
    const transactions = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]!

      transactions.push({
        id: `tx-${i}`,
        type: 'income' as const,
        date: dateStr,
        amountKRW: 100000 + i * 10000,
        categoryId: 'income-sales',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({
      transactions,
    })
    return <StreakBadge />
  },
}

/** Lv.1 - 구멍가게 사장님 (10건 미만) */
export const Level1Beginner: Story = {
  name: 'Lv.1 구멍가게 사장님',
  render: () => {
    useSettingsStore.setState({
      currentStreak: 3,
      maxStreak: 5,
      lastEntryDate: getTodayLocal(),
    })

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    useTransactionStore.setState({
      transactions: [
        {
          id: '1',
          type: 'income' as const,
          date: `${currentMonth}-15`,
          amountKRW: 500000,
          categoryId: 'income-sales',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'expense' as const,
          date: `${currentMonth}-16`,
          amountKRW: 100000,
          categoryId: 'expense-supplies',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })
    return <StreakBadge />
  },
}

/** Lv.3 - 동네 명소 (50건 이상) */
export const Level3Famous: Story = {
  name: 'Lv.3 동네 명소',
  render: () => {
    useSettingsStore.setState({
      currentStreak: 15,
      maxStreak: 25,
      lastEntryDate: getTodayLocal(),
    })

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const transactions = []
    for (let i = 0; i < 50; i++) {
      const day = Math.floor(i / 2) + 1
      const dateStr = `${currentMonth}-${String(Math.min(day, 28)).padStart(2, '0')}`

      transactions.push({
        id: `tx-${i}`,
        type: i % 2 === 0 ? ('income' as const) : ('expense' as const),
        date: dateStr,
        amountKRW: 500000,
        categoryId: i % 2 === 0 ? 'income-sales' : 'expense-supplies',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({
      transactions,
    })
    return <StreakBadge />
  },
}

/** Lv.6 - 사업의 달인 (500건 이상) */
export const Level6Master: Story = {
  name: 'Lv.6 사업의 달인',
  render: () => {
    useSettingsStore.setState({
      currentStreak: 90,
      maxStreak: 90,
      lastEntryDate: getTodayLocal(),
    })

    const transactions = []
    for (let i = 0; i < 550; i++) {
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(i / 25))
      const dateStr = date.toISOString().split('T')[0]!

      transactions.push({
        id: `tx-${i}`,
        type: i % 3 === 0 ? ('income' as const) : ('expense' as const),
        date: dateStr,
        amountKRW: 100000 + Math.random() * 900000,
        categoryId: i % 3 === 0 ? 'income-sales' : 'expense-supplies',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    useTransactionStore.setState({
      transactions,
    })
    return <StreakBadge />
  },
}
