import type { Meta, StoryObj } from '@storybook/react'
import { ToastProvider, useToast } from './Toast'

const meta: Meta = {
  title: '공통 컴포넌트/Toast',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
}

export default meta
type Story = StoryObj

function ToastTrigger({ type, message }: { type: 'success' | 'error' | 'warning' | 'info'; message: string }) {
  const { showToast } = useToast()
  return (
    <button
      onClick={() => showToast(message, type)}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
    >
      {type} 토스트 표시
    </button>
  )
}

export const AllTypes: Story = {
  name: '모든 타입',
  render: () => {
    const { showToast } = useToast()
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => showToast('저장이 완료되었습니다.', 'success')}
          className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
        >
          성공 토스트
        </button>
        <button
          onClick={() => showToast('데이터 저장에 실패했습니다.', 'error')}
          className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
        >
          에러 토스트
        </button>
        <button
          onClick={() => showToast('브라우저 저장 공간이 부족합니다.', 'warning')}
          className="px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600 transition-colors"
        >
          경고 토스트
        </button>
        <button
          onClick={() => showToast('거래 내역을 불러왔습니다.', 'info')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
        >
          정보 토스트
        </button>
      </div>
    )
  },
}

export const SuccessToast: Story = {
  name: '성공 토스트',
  render: () => <ToastTrigger type="success" message="거래가 성공적으로 저장되었습니다." />,
}

export const ErrorToast: Story = {
  name: '에러 토스트',
  render: () => <ToastTrigger type="error" message="데이터 저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요." />,
}
