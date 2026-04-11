/**
 * LocalStorageAdapter 구현
 * StorageAdapter 인터페이스를 localStorage로 구현
 * QuotaExceededError 처리 및 커스텀 이벤트 발생
 */

import type { StorageAdapter } from '@/types/storage'

/** 스토리지 에러 이벤트 상세 */
export interface StorageErrorDetail {
  key: string
  error: string
  type: 'quota_exceeded' | 'unknown'
}

/** 스토리지 에러 커스텀 이벤트 이름 */
export const STORAGE_ERROR_EVENT = 'storage-error'

/**
 * 스토리지 에러 이벤트 발생
 */
function dispatchStorageError(detail: StorageErrorDetail): void {
  window.dispatchEvent(new CustomEvent<StorageErrorDetail>(STORAGE_ERROR_EVENT, { detail }))
}

/**
 * LocalStorageAdapter
 * Zustand persist middleware의 StateStorage와 호환
 */
export const localStorageAdapter: StorageAdapter = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`[스토리지] 읽기 실패 (key: ${key}):`, error)
      return null
    }
  },

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      const isQuotaError =
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' ||
          error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
          error.code === 22)

      const detail: StorageErrorDetail = {
        key,
        error: error instanceof Error ? error.message : String(error),
        type: isQuotaError ? 'quota_exceeded' : 'unknown',
      }

      console.error(`[스토리지] 저장 실패 (key: ${key}):`, error)
      dispatchStorageError(detail)

      // Zustand persist에게 에러를 전파하여 상위 처리 가능하도록
      throw error
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`[스토리지] 삭제 실패 (key: ${key}):`, error)
    }
  },
}
