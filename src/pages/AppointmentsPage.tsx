import { Link } from 'react-router-dom'
import { mockAppointments } from '../data/mockAppointments'
import { Card, PageTitle } from '../components'
import type { AppointmentStatus } from '../types'

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

function AppointmentsPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 p-8 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-[var(--text)] transition hover:text-[var(--text-h)]"
          >
            ← Dashboard
          </Link>
          <PageTitle>Appointments</PageTitle>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {mockAppointments.map((apt) => (
                <tr
                  key={apt.id}
                  className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--bg)]"
                >
                  <td className="px-4 py-3 text-sm text-[var(--text-h)]">
                    {formatDate(apt.date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{apt.time}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-h)]">
                        {apt.clientName}
                      </p>
                      {apt.clientPhone && (
                        <p className="text-xs text-[var(--text)]">{apt.clientPhone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text)]">{apt.service}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={apt.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text)] max-w-[200px] truncate">
                    {apt.notes ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  )
}

export default AppointmentsPage
