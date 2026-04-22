import type { Meta, StoryObj } from '@storybook/react'
import TransactionForm from './TransactionForm'

const meta: Meta<typeof TransactionForm> = {
  title: 'Transactions/TransactionForm',
  component: TransactionForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TransactionForm>

export const NewIncome: Story = {
  name: '신규 매출 입력',
  args: {
    onSuccess: () => alert('저장 성공'),
    onCancel: () => alert('취소'),
  },
}

export const NewExpense: Story = {
  name: '신규 비용 입력',
  args: {
    initialData: {
      type: 'expense',
    },
    onSuccess: () => alert('저장 성공'),
    onCancel: () => alert('취소'),
  },
}

export const EditMode: Story = {
  name: '수정 모드',
  args: {
    initialData: {
      id: 'tx-001',
      type: 'income',
      date: '2026-04-10',
      amountKRW: 3500000,
      categoryId: 'income-service',
      memo: '4월 용역 대금',
    },
    onSuccess: () => alert('수정 완료'),
    onCancel: () => alert('취소'),
  },
}

export const WithFieldErrors: Story = {
  name: '필드 에러 상태',
  render: (args) => {
    // 빈 폼을 submit해서 validation 에러를 노출시키는 render 패턴
    // form ref를 통해 submit 트리거
    return (
      <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow">
        <TransactionForm
          {...args}
          initialData={{ type: 'income', date: '', amountKRW: undefined as unknown as number, categoryId: '' }}
        />
      </div>
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: '날짜·금액·카테고리를 비운 채 제출하면 각 필드의 에러 메시지가 표시됩니다.',
      },
    },
  },
}
