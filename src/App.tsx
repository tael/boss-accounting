import { HashRouter, Routes, Route, Navigate } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import DashboardPage from '@/pages/DashboardPage'
import TransactionsPage from '@/pages/TransactionsPage'
import StatementsPage from '@/pages/StatementsPage'
import AnalysisPage from '@/pages/AnalysisPage'
import TaxPage from '@/pages/TaxPage'
import DataPage from '@/pages/DataPage'

export default function App() {
  return (
    <HashRouter>
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
    </HashRouter>
  )
}
