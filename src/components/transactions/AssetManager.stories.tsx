import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import AssetManager from './AssetManager'
import { useAssetStore } from '@/stores/assetStore'

const meta: Meta<typeof AssetManager> = {
  title: '거래 관리/AssetManager',
  component: AssetManager,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof AssetManager>

export const Empty: Story = {
  name: '자산 없음 (빈 상태)',
  decorators: [
    (Story) => {
      useEffect(() => {
        useAssetStore.setState({ assets: [] })
      }, [])
      return <Story />
    },
  ],
}

export const WithAssets: Story = {
  name: '자산 목록',
  decorators: [
    (Story) => {
      useEffect(() => {
        useAssetStore.setState({
          assets: [
            {
              id: 'asset-001',
              name: '사무용 노트북',
              purchaseDate: '2025-01-15',
              purchaseCostKRW: 1800000,
              usefulLifeYears: 4,
              residualValueKRW: 0,
              monthlyDepreciationKRW: 37500,
              depreciationCategoryId: 'expense-depreciation',
              enabled: true,
              lastAppliedMonth: '2026-03',
            },
            {
              id: 'asset-002',
              name: '업무용 카메라',
              purchaseDate: '2024-06-01',
              purchaseCostKRW: 900000,
              usefulLifeYears: 5,
              residualValueKRW: 0,
              monthlyDepreciationKRW: 15000,
              depreciationCategoryId: 'expense-depreciation',
              enabled: false,
            },
          ],
        })
      }, [])
      return <Story />
    },
  ],
}
