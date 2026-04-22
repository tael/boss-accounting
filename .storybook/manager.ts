import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

const theme = create({
  base: 'light',
  brandTitle: '사장님 회계 도우미',
  brandUrl: 'https://github.com/tael/boss-accounting',
  brandImage: undefined,
  brandTarget: '_self',

  // 앱 브랜드 컬러 (에메랄드 초록)
  colorPrimary: '#10b981',
  colorSecondary: '#059669',

  // UI
  appBg: '#f9fafb',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 12,

  // 폰트
  fontBase: '"Pretendard", "Apple SD Gothic Neo", sans-serif',
  fontCode: 'monospace',

  // 텍스트
  textColor: '#1f2937',
  textInverseColor: '#ffffff',
  textMutedColor: '#6b7280',

  // 툴바
  barTextColor: '#6b7280',
  barHoverColor: '#10b981',
  barSelectedColor: '#10b981',
  barBg: '#ffffff',

  // 버튼
  buttonBg: '#f3f4f6',
  buttonBorder: '#e5e7eb',

  // 입력
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  inputTextColor: '#1f2937',
  inputBorderRadius: 8,
})

addons.setConfig({ theme })
