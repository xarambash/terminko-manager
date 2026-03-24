import { useAuth } from '../hooks/useAuth'
import { Button, Card, PageTitle } from '../components'

function DashboardPage() {
  const { logout, user } = useAuth()

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageTitle>Dashboard</PageTitle>
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card to="/appointments" className="p-6">
          <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">Appointments</h2>
          <p className="text-sm text-[var(--text)]">View and manage appointments</p>
        </Card>
        {user?.role === 'owner' && (
          <Card to="/resources" className="p-6">
            <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">Resources</h2>
            <p className="text-sm text-[var(--text)]">Manage staff and resources for your business</p>
          </Card>
        )}
      </div>
    </main>
  )
}

export default DashboardPage
