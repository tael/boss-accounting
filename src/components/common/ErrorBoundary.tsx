import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  /** 섹션 단위로 래핑할 때 전달. 생략 시 전체 페이지 오류 UI 표시 */
  fallback?: ReactNode
}
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(_error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback
      }
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-xl border border-red-200 p-6 space-y-4 text-center">
            <p className="text-2xl">⚠️</p>
            <h1 className="text-lg font-bold text-gray-900">오류가 발생했습니다</h1>
            <p className="text-sm text-gray-500">페이지를 새로고침하면 해결될 수 있습니다.</p>
            <p className="text-xs text-red-400 font-mono break-all">{this.state.error?.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
