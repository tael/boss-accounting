import type { Meta, StoryObj } from '@storybook/react'
import TaxDisclaimer from './TaxDisclaimer'

const meta: Meta<typeof TaxDisclaimer> = {
  title: '세금 계산기/TaxDisclaimer',
  component: TaxDisclaimer,
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
type Story = StoryObj<typeof TaxDisclaimer>

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: '세금 계산 결과가 정보 제공용일 수 있음을 명시하는 면책 고지입니다.',
      },
    },
  },
}
