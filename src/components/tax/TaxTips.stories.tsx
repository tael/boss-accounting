import type { Meta, StoryObj } from '@storybook/react'
import TaxTips from './TaxTips'

const meta: Meta<typeof TaxTips> = {
  title: '세금 계산기/TaxTips',
  component: TaxTips,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md p-4 bg-gray-50">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TaxTips>

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: '부가가치세, 종합소득세, 절세 가이드 관련 도서 참고문헌을 표시합니다.',
      },
    },
  },
}
