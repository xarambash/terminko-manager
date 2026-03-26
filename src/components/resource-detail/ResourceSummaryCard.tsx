import { useTranslation } from 'react-i18next'
import { Card } from '../ui/Card'
import type { Resource } from '../../types/resources'

export function ResourceSummaryCard({ resource }: { resource: Resource }) {
  const { t } = useTranslation()

  return (
    <Card className="p-4 sm:p-6">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--text)]">{t('resourceDetail.summary.email')}</dt>
          <dd className="font-medium text-[var(--text-h)]">{resource.email ?? t('common.dash')}</dd>
        </div>
        <div>
          <dt className="text-[var(--text)]">{t('resourceDetail.summary.phone')}</dt>
          <dd className="font-medium text-[var(--text-h)]">{resource.phone ?? t('common.dash')}</dd>
        </div>
        <div>
          <dt className="text-[var(--text)]">{t('resourceDetail.summary.active')}</dt>
          <dd className="font-medium text-[var(--text-h)]">
            {resource.isActive ? t('common.yes') : t('common.no')}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
