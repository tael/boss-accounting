import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Common/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    currencyMode: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    label: '거래처명',
    placeholder: '거래처명을 입력하세요',
  },
}

export const WithValue: Story = {
  args: {
    label: '거래처명',
    value: '강남 편의점',
  },
}

export const Required: Story = {
  args: {
    label: '거래처명',
    placeholder: '필수 입력',
    required: true,
  },
}

export const WithError: Story = {
  args: {
    label: '거래처명',
    value: '',
    required: true,
    error: '거래처명을 입력해주세요',
  },
}

export const Disabled: Story = {
  args: {
    label: '등록일',
    value: '2024-01-15',
    disabled: true,
  },
}

export const CurrencyMode: Story = {
  render: () => {
    const [value, setValue] = useState('1500000')
    return (
      <Input
        label="금액"
        currencyMode
        value={value}
        onChange={setValue}
        placeholder="금액을 입력하세요"
      />
    )
  },
}

export const CurrencyModeEmpty: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <Input
        label="금액"
        currencyMode
        value={value}
        onChange={setValue}
        placeholder="0"
        required
      />
    )
  },
}

export const CurrencyModeWithError: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <Input
        label="매출 금액"
        currencyMode
        value={value}
        onChange={setValue}
        placeholder="0"
        required
        error="금액을 입력해주세요"
      />
    )
  },
}
