import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppShell } from '@mantine/core'
import { AppHeader } from './AppHeader'
import { AppSidebarNav } from './AppSidebarNav'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{
        width: 240,
        breakpoint: 'lg',
        collapsed: { mobile: !mobileOpen },
      }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader
          mobileOpen={mobileOpen}
          onMobileToggle={() => setMobileOpen((o) => !o)}
        />
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppSidebarNav onNavigate={() => setMobileOpen(false)} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
