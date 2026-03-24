import { useState } from 'react'
import {
  Button,
  Card,
  CreateResourceModal,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { useResources } from '../hooks'

function ResourcesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { data: resources, isPending, isError, error } = useResources()

  return (
    <main className="flex flex-1 flex-col gap-8 p-8 text-left">
      <PageSectionHeader
        title="Resources"
        actions={
          <Button type="button" onClick={() => setModalOpen(true)}>
            Create resource
          </Button>
        }
      />

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText="Loading resources…"
      />

      {!isPending && !isError && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-h)]">
                    Active
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-h)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(resources ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-[var(--text)]"
                    >
                      No resources yet. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  (resources ?? []).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--bg)]"
                    >
                      <td className="px-4 py-3 text-sm text-[var(--text-h)]">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">
                        {r.email ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">
                        {r.phone ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text)]">
                        {r.isActive ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled
                            title="Edit will be available in a future update"
                            className="px-3 py-1.5 text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled
                            title="Delete will be available in a future update"
                            className="px-3 py-1.5 text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CreateResourceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}

export default ResourcesPage
