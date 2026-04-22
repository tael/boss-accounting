import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import CategorySelect from './CategorySelect'

const meta: Meta<typeof CategorySelect> = {
  title: '거래 관리/CategorySelect',
  component: CategorySelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CategorySelect>

export const IncomeType: Story = {
  name: '매출 카테고리',
  render: () => {
    const [value, setValue] = useState('')
    return <CategorySelect type="income" value={value} onChange={setValue} />
  },
}

export const ExpenseType: Story = {
  name: '비용 카테고리',
  render: () => {
    const [value, setValue] = useState('')
    return <CategorySelect type="expense" value={value} onChange={setValue} />
  },
}

export const WithSelectedValue: Story = {
  name: '선택된 상태',
  render: () => {
    const [value, setValue] = useState('expense-rent')
    return <CategorySelect type="expense" value={value} onChange={setValue} />
  },
}

export const WithError: Story = {
  name: '에러 상태',
  render: () => {
    const [value, setValue] = useState('')
    return (
      <CategorySelect
        type="expense"
        value={value}
        onChange={setValue}
        error="카테고리를 선택하세요"
      />
    )
  },
}

export const Disabled: Story = {
  name: '비활성화',
  render: () => (
    <CategorySelect type="income" value="income-service" onChange={() => {}} disabled />
  ),
}
