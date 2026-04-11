import { useState } from 'react'
import { NavLink } from 'react-router'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',             label: '대시보드',   icon: '📊' },
  { to: '/transactions', label: '거래 기록',  icon: '📋' },
  { to: '/statements',   label: '재무제표',   icon: '📄' },
  { to: '/analysis',     label: '분석',       icon: '📈' },
  { to: '/tax',          label: '세금',       icon: '🧾' },
  { to: '/data',         label: '데이터 관리', icon: '💾' },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-2">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
            ].join(' ')
          }
        >
          <span className="text-base shrink-0">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <button
        className="md:hidden fixed top-3.5 left-4 z-40 p-1.5 rounded-[var(--radius-sm)] text-gray-600 hover:bg-gray-100"
        onClick={() => setMobileOpen(true)}
        aria-label="메뉴 열기"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 모바일 드로어 */}
      <aside
        className={[
          'md:hidden fixed top-0 left-0 h-full w-60 bg-white border-r border-gray-200 z-40',
          'flex flex-col pt-14 transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="py-4 flex-1 overflow-y-auto">
          <NavItems onNavigate={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* 데스크탑 사이드바 */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-200 shrink-0">
        <div className="py-4 flex-1 overflow-y-auto">
          <NavItems />
        </div>
      </aside>
    </>
  )
}
