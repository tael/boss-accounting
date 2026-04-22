import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import VatCalculator from './VatCalculator'
import { useSettingsStore } from '@/stores/settingsStore'

const meta: Meta<typeof VatCalculator> = {
  title: 'Tax/VatCalculator',
  component: VatCalculator,
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
type Story = StoryObj<typeof VatCalculator>

export const Empty: Story = {
  name: '빈 초기 상태',
  decorators: [
    (Story) => {
      useEffect(() => {
        useSettingsStore.setState({ taxType: 'general' })
      }, [])
      return <Story />
    },
  ],
}

export const GeneralTaxpayerCalculated: Story = {
  name: '일반과세자 계산 결과 (매출 1000만, 비용 500만)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useSettingsStore.setState({ taxType: 'general' })
      }, [])
      return <Story />
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          '일반과세자로 매출액 1,000만 원, 적격증빙 매입액 500만 원을 입력한 상태입니다. 매출세액 100만 원에서 매입세액 50만 원을 차감하여 납부세액 50만 원이 계산됩니다.',
      },
    },
  },
}

export const SimplifiedTaxpayerRestaurant: Story = {
  name: '간이과세자 음식점 계산',
  decorators: [
    (Story) => {
      useEffect(() => {
        useSettingsStore.setState({ taxType: 'simplified' })
      }, [])
      return <Story />
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          '간이과세자 음식점 업종으로 매출액 1,000만 원을 입력한 상태입니다. 음식점 부가가치율을 적용하여 세액이 자동 계산됩니다.',
      },
    },
  },
}
