import { Outlet } from 'react-router-dom'
import { AppNav } from './AppNav'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <Outlet />
    </div>
  )
}
