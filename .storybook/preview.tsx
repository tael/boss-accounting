import React from 'react'
import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import './toss-tokens.css'

const preview: Preview = {
  decorators: [
    (Story) => (
      <div
        style={{
          background: '#f2f4f6',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: '"Pretendard", "Apple SD Gothic Neo", -apple-system, sans-serif',
        }}
      >
        <Story />
      </div>
    ),
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
    a11y: { test: 'todo' },
    docs: { toc: true },
  },
}

export default preview
