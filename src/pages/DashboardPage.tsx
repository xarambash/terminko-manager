import { useAuth } from '../hooks/useAuth'
import { Button, Card, PageTitle } from '../components'

function DashboardPage() {
  const { logout } = useAuth()

  return (
    <main className="flex flex-1 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <PageTitle>Dashboard</PageTitle>
        <Button variant="secondary" onClick={logout}>
          Odjavi se
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Card to="/appointments" className="p-6">
          <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">Termini</h2>
          <p className="text-sm text-[var(--text)]">Pregled i upravljanje terminima</p>
        </Card>
      </div>
    </main>
  )
}

export default DashboardPage
