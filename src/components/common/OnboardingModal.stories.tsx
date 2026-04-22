import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { OnboardingModal } from './OnboardingModal'
import { useSettingsStore } from '@/stores/settingsStore'

const meta: Meta<typeof OnboardingModal> = {
  title: '공통 컴포넌트/OnboardingModal',
  component: OnboardingModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof OnboardingModal>

export const Open: Story = {
  name: '온보딩 모달 (열린 상태)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useSettingsStore.setState({ onboardingCompleted: false })
      }, [])
      return <Story />
    },
  ],
  args: {
    isOpen: true,
  },
}

export const Closed: Story = {
  name: '온보딩 모달 (닫힌 상태)',
  args: {
    isOpen: false,
  },
}
