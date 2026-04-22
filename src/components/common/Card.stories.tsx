import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: '공통 컴포넌트/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Card>

export const WithTitle: Story = {
  name: '타이틀 있음',
  args: {
    title: '4월 요약',
    children: (
      <div className="space-y-2">
        <p className="text-sm text-gray-600">매출: ₩3,500,000</p>
        <p className="text-sm text-gray-600">비용: ₩1,200,000</p>
        <p className="text-sm font-semibold text-emerald-600">순이익: ₩2,300,000</p>
      </div>
    ),
  },
}

export const WithoutTitle: Story = {
  name: '타이틀 없음',
  args: {
    children: (
      <p className="text-sm text-gray-600">타이틀 없이 내용만 표시되는 카드입니다.</p>
    ),
  },
}

export const WithCustomClassName: Story = {
  name: '커스텀 클래스',
  args: {
    title: '강조 카드',
    className: 'border-blue-200 bg-blue-50',
    children: (
      <p className="text-sm text-blue-700">파란 테두리와 배경이 적용된 카드입니다.</p>
    ),
  },
}
