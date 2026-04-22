import type { Meta, StoryObj } from '@storybook/react'
import SmsParserInput from './SmsParserInput'

const meta: Meta<typeof SmsParserInput> = {
  title: '거래 관리/SmsParserInput',
  component: SmsParserInput,
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
type Story = StoryObj<typeof SmsParserInput>

export const Default: Story = {
  name: '기본 상태',
  args: {
    onSuccess: () => alert('거래 추가 완료'),
  },
}

export const WithCallback: Story = {
  name: '콜백 없음',
  args: {},
}
