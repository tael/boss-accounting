import { Outlet } from 'react-router'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ToastProvider } from '@/components/common/Toast'
import { OnboardingModal } from '@/components/common/OnboardingModal'
import { QuickEntryFab } from '@/components/common/QuickEntryFab'
import { useSettingsStore } from '@/stores/settingsStore'

export function Layout() {
  const onboardingCompleted = useSettingsStore((s) => s.onboardingCompleted)

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
      <OnboardingModal isOpen={!onboardingCompleted} />
      <QuickEntryFab />
    </ToastProvider>
  )
}
