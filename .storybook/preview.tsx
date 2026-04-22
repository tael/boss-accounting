import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import './toss-tokens.css'

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const layout = context.parameters?.layout
      const isFullscreen = layout === 'fullscreen'

      return (
        <div
          style={{
            background: '#f2f4f6',
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isFullscreen ? 'stretch' : 'center',
            justifyContent: isFullscreen ? 'flex-start' : 'center',
            padding: isFullscreen ? 0 : '32px 24px',
            fontFamily: '"Pretendard", -apple-system, "Apple SD Gothic Neo", sans-serif',
            letterSpacing: '-0.02em',
            WebkitFontSmoothing: 'antialiased',
            boxSizing: 'border-box',
          }}
        >
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    // Storybook backgrounds addon 완전 비활성화 (토스 CSS가 직접 제어)
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
    docs: { toc: true },
    viewport: {
      viewports: {
        iphone14: { name: 'iPhone 14', styles: { width: '390px', height: '844px' } },
        iphone14pro: { name: 'iPhone 14 Pro', styles: { width: '393px', height: '852px' } },
        galaxyS24: { name: 'Galaxy S24', styles: { width: '360px', height: '780px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '800px' } },
      },
      defaultViewport: 'iphone14',
    },
    layout: 'centered',
  },
}

export default preview
