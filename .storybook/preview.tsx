import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import './toss-tokens.css'

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const layout = context.parameters?.layout
      const isFullscreen = layout === 'fullscreen'

      if (isFullscreen) {
        return <Story />
      }

      return (
        <div style={{
          background: '#f2f4f6',
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          boxSizing: 'border-box' as const,
          fontFamily: '"Pretendard", -apple-system, "Apple SD Gothic Neo", sans-serif',
          letterSpacing: '-0.02em',
          WebkitFontSmoothing: 'antialiased' as const,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0,23,51,0.06), 0 8px 24px rgba(0,23,51,0.04)',
            border: '1px solid #e5e8eb',
            width: '100%',
            maxWidth: '480px',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: '16px',
          }}>
            <Story />
          </div>
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
