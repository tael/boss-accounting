/**
 * Vitest 테스트 설정
 */

import '@testing-library/jest-dom'

// localStorage mock (jsdom 환경에서 기본 제공되나 명시적으로 설정)
Object.defineProperty(window, 'localStorage', {
  value: (() => {
    let store: Record<string, string> = {}
    return {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
      get length() {
        return Object.keys(store).length
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    }
  })(),
  writable: true,
})

// crypto.randomUUID mock (jsdom에서 미지원 환경 대비)
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = Math.floor(Math.random() * 16)
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
      },
    },
    writable: true,
  })
}
