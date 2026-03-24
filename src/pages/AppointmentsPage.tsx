import { Card, PageSectionHeader, QueryStatusBanner } from '../components'
import { useAppointments } from '../hooks'
import type { AppointmentStatus } from '../types'

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  canceled: 'Canceled',
}

const statusStyles: Record<AppointmentStatus, string> = {
  scheduled: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function formatAppointmentDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatAppointmentTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeStatus(status: string): AppointmentStatus | null {
  if (status === 'scheduled' || status === 'completed' || status === 'canceled') {
    return status
  }
  return null
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status)
  const label = normalized ? statusLabels[normalized] : status
  const styleClass = normalized
    ? statusStyles[normalized]
    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styleClass}`}>
      {label}
    </span>
  )
}

function AppointmentsPage() {
  const { data: appointments, isPending, isError, error } = useAppointments()

  return (
    <main className="flex flex-1 flex-col gap-8 p-8 text-left">
      <PageSectionHeader title="Appointments" />

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText="Loading appointments…"
      />

      {!isPending && !isError && (
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
                {(appointments ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-[var(--text)]"
                    >
                      No appointments yet.
                    </td>
                  </tr>
                ) : (
                  (appointments ?? []).map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--bg)]"
                    >
                      <td className="px-4 py-3 text-sm text-[var(--text-h)]">
                        {formatAppointmentDate(apt.startAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">
                        {formatAppointmentTime(apt.startAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-h)]">
                            {apt.guest.name}
                          </p>
                          <p className="text-xs text-[var(--text)]">{apt.guest.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">
                        {apt.service.name}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)] max-w-[200px] truncate">
                        {apt.notes ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  )
}

export default AppointmentsPage
