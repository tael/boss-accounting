import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const toastStyles: Record<ToastType, { bg: string; icon: string; text: string }> = {
  success: { bg: 'bg-green-50 border-green-200', icon: '✓', text: 'text-green-800' },
  error:   { bg: 'bg-red-50 border-red-200',     icon: '✕', text: 'text-red-800' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: '!', text: 'text-yellow-800' },
  info:    { bg: 'bg-blue-50 border-blue-200',   icon: 'i', text: 'text-blue-800' },
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const style = toastStyles[item.type]

  useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), 4000)
    return () => clearTimeout(timer)
  }, [item.id, onRemove])

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] border shadow-md',
        'min-w-[280px] max-w-[400px] text-sm',
        style.bg, style.text,
      ].join(' ')}
      role="alert"
    >
      <span className="font-bold shrink-0 mt-0.5">{style.icon}</span>
      <span className="flex-1">{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++counterRef.current}`
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  // storage-error 이벤트 자동 감지
  useEffect(() => {
    function handleStorageError(e: Event) {
      const detail = (e as CustomEvent<{ key?: string; error?: string }>).detail
      const msg = detail?.error
        ? `데이터 저장 실패: ${detail.error}`
        : '데이터 저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.'
      showToast(msg, 'error')
    }

    window.addEventListener('storage-error', handleStorageError)
    return () => window.removeEventListener('storage-error', handleStorageError)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} item={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
