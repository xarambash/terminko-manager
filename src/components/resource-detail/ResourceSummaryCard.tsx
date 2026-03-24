import { Card } from '../ui/Card'
import type { Resource } from '../../types/resources'

export function ResourceSummaryCard({ resource }: { resource: Resource }) {
  return (
    <Card className="p-6">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--text)]">Email</dt>
          <dd className="font-medium text-[var(--text-h)]">{resource.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text)]">Phone</dt>
          <dd className="font-medium text-[var(--text-h)]">{resource.phone ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--text)]">Active</dt>
          <dd className="font-medium text-[var(--text-h)]">{resource.isActive ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
    </Card>
  )
}
