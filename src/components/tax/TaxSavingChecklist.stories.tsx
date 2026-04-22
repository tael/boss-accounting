import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import TaxSavingChecklist from './TaxSavingChecklist'
import { useSettingsStore } from '@/stores/settingsStore'

const meta: Meta<typeof TaxSavingChecklist> = {
  title: '세금 계산기/TaxSavingChecklist',
  component: TaxSavingChecklist,
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
type Story = StoryObj<typeof TaxSavingChecklist>

export const AllUnchecked: Story = {
  name: '0개 체크 (초기 상태)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useSettingsStore.setState({ taxSavingChecklist: [] })
      }, [])
      return <Story />
    },
  ],
  parameters: {
    docs: {
      description: {
        story: '절세 체크리스트가 모두 미완료 상태입니다. 진행률은 0%입니다.',
      },
    },
  },
}

export const PartiallyChecked: Story = {
  name: '3개 체크 (진행 중)',
  decorators: [
    (Story) => {
      useEffect(() => {
        // TAX_SAVING_ITEMS 중 처음 3개 ID를 선택
        useSettingsStore.setState({
          taxSavingChecklist: ['receipt-tracking', 'home-office-deduction', 'medical-expense'],
        })
      }, [])
      return <Story />
    },
  ],
  parameters: {
    docs: {
      description: {
        story: '절세 체크리스트 중 3개 항목이 완료된 상태입니다. 완료 항목의 예상 절세액이 표시됩니다.',
      },
    },
  },
}
