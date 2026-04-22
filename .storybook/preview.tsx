import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import './toss-tokens.css'

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const isFullscreen = context.parameters?.layout === 'fullscreen'
      const isCentered = context.parameters?.layout === 'centered' || !context.parameters?.layout
      return (
        <div
          style={{
            background: '#f2f4f6',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCentered && !isFullscreen ? 'center' : 'stretch',
            justifyContent: isCentered && !isFullscreen ? 'center' : 'flex-start',
            padding: isFullscreen ? '0' : '24px',
            fontFamily: '"Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif',
            letterSpacing: '-0.02em',
            WebkitFontSmoothing: 'antialiased' as const,
          }}
        >
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    backgrounds: {
      default: 'toss-grey',
      values: [
        { name: 'toss-grey', value: '#f2f4f6' },
        { name: 'toss-white', value: '#ffffff' },
        { name: 'dark', value: '#191f28' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        iphone14: {
          name: 'iPhone 14',
          styles: { width: '390px', height: '844px' },
        },
        iphone14Pro: {
          name: 'iPhone 14 Pro',
          styles: { width: '393px', height: '852px' },
        },
        galaxyS24: {
          name: 'Galaxy S24',
          styles: { width: '360px', height: '780px' },
        },
        ipad: {
          name: 'iPad',
          styles: { width: '768px', height: '1024px' },
        },
      },
      defaultViewport: 'iphone14',
    },
    a11y: { test: 'todo' },
    docs: { toc: true },
  },
}

export default preview
