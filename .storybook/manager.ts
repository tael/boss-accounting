import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming/create'

const theme = create({
  base: 'light',
  brandTitle: '사장님 회계 도우미',
  brandUrl: 'https://github.com/tael/boss-accounting',
  brandTarget: '_self',
  brandImage: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="%233182f6"/><text x="50%25" y="55%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-family="sans-serif">🧾</text></svg>',

  colorPrimary: '#3182f6',
  colorSecondary: '#0064FF',

  appBg: '#f2f4f6',
  appContentBg: '#ffffff',
  appPreviewBg: '#f2f4f6',
  appBorderColor: '#e5e8eb',
  appBorderRadius: 8,

  fontBase: '"Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif',
  fontCode: '"SF Mono", "Fira Code", monospace',

  textColor: '#191f28',
  textInverseColor: '#ffffff',
  textMutedColor: '#8b95a1',

  barTextColor: '#4e5968',
  barHoverColor: '#3182f6',
  barSelectedColor: '#3182f6',
  barBg: '#ffffff',

  buttonBg: '#f2f4f6',
  buttonBorder: '#e5e8eb',

  inputBg: '#ffffff',
  inputBorder: '#e5e8eb',
  inputTextColor: '#191f28',
  inputBorderRadius: 8,
})

addons.setConfig({ theme })
