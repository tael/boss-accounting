import type { Meta, StoryObj } from '@storybook/react'
import { QuickEntryFab } from './QuickEntryFab'

const meta: Meta<typeof QuickEntryFab> = {
  title: '공통 컴포넌트/QuickEntryFab',
  component: QuickEntryFab,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-gray-50 p-4 relative">
        <p className="text-sm text-gray-400">모바일 화면에서 우하단 FAB 버튼이 표시됩니다.</p>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof QuickEntryFab>

export const Default: Story = {
  name: '기본 FAB 버튼',
}

export const Desktop: Story = {
  name: '데스크탑 (FAB 숨김)',
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: 'md 이상 화면에서는 FAB 버튼이 숨겨집니다 (md:hidden 클래스).',
      },
    },
  },
}
