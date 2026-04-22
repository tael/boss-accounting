import type { Meta, StoryObj } from '@storybook/react'
import LaborCalc from './LaborCalc'

const meta: Meta<typeof LaborCalc> = {
  title: '세금 계산기/LaborCalc',
  component: LaborCalc,
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
type Story = StoryObj<typeof LaborCalc>

export const Empty: Story = {
  name: '빈 초기 상태',
}

export const MinimumWageFullTime: Story = {
  name: '주 40시간 시급 10,030원 (최저임금)',
  parameters: {
    docs: {
      description: {
        story:
          '최저임금 기준 시급 10,030원으로 주 40시간 근무했을 때 계산 결과입니다. 기본 주급 401,200원 + 주휴수당 80,240원 = 주 합계 481,440원, 월 환산 2,091,843원이 계산됩니다.',
      },
    },
  },
}

export const PartTimeWithoutHolidayPay: Story = {
  name: '주 10시간 (주휴수당 미해당)',
  parameters: {
    docs: {
      description: {
        story:
          '주 15시간 미만으로 근무하는 경우 주휴수당이 발생하지 않습니다. 시급 10,030원 × 10시간 = 기본 주급 100,300원만 계산되고, 주휴수당 없음 상태를 표시합니다.',
      },
    },
  },
}

export const WithInsurance: Story = {
  name: '4대 보험 포함 켜진 상태 (주 40시간, 시급 10,030원)',
  parameters: {
    docs: {
      description: {
        story:
          '4대 보험(국민연금, 건강보험, 고용보험, 산재보험) 포함 옵션을 켜서 사업주 부담 보험료를 추가로 표시합니다. 월 환산 인건비 2,091,843원에 사업주 부담 보험료를 합산한 "실질 월 총 인건비"가 계산됩니다.',
      },
    },
  },
}
