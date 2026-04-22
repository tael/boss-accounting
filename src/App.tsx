import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Layout } from '@/components/layout/Layout'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'))
const StatementsPage = lazy(() => import('@/pages/StatementsPage'))
const AnalysisPage = lazy(() => import('@/pages/AnalysisPage'))
const TaxPage = lazy(() => import('@/pages/TaxPage'))
const DataPage = lazy(() => import('@/pages/DataPage'))

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        }>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/statements" element={<StatementsPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/tax" element={<TaxPage />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  )
}
