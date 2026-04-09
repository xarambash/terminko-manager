import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { AppSidebarNav } from './AppSidebarNav'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)] antialiased">
      <AppHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-[90rem] flex-1">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[18rem] shrink-0 overflow-y-auto  border-[var(--border)] py-8 pr-6 pl-2 lg:block">
          <AppSidebarNav />
        </aside>
        <div className="min-w-0 flex-1 overflow-x-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
