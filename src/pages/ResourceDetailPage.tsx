import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Card, PageSectionHeader, QueryStatusBanner } from '../components'
import {
  ResourceFreeDaysSection,
  ResourceServicesSection,
  ResourceSummaryCard,
  ResourceWorkingHoursSection,
} from '../components/resource-detail'
import { useResources } from '../hooks'
const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function ResourceDetailPage() {
  const { t } = useTranslation()
  const { resourceId } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const { data: resources, isPending, isError, error } = useResources()

  const resource = resourceId ? resources?.find((r) => r.id === resourceId) : undefined
  const listReady = !isPending && !isError && resources != null
  const notFound = listReady && resourceId && !resource

  const title = resource
    ? `${resource.firstName} ${resource.lastName}`.trim() || t('resourceDetail.title')
    : notFound
      ? t('resourceDetail.notFoundTitle')
      : t('resourceDetail.title')

  return (
    <main className={pageClass}>
      <PageSectionHeader
        title={title}
        backTo="/resources"
        backLabel={t('nav.backResources')}
      />

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.resource')}
      />

      {notFound && (
        <Card className="p-4 sm:p-6">
          <p className="text-sm text-[var(--text)]">{t('resourceDetail.notFoundBody')}</p>
          <Button type="button" className="mt-4" onClick={() => navigate('/resources')}>
            {t('resourceDetail.backToResources')}
          </Button>
        </Card>
      )}

      {resource && resourceId && (
        <>
          <ResourceSummaryCard resource={resource} />
          <ResourceServicesSection resourceId={resourceId} />
          <ResourceWorkingHoursSection resourceId={resourceId} />
          <ResourceFreeDaysSection resourceId={resourceId} />
        </>
      )}
    </main>
  )
}

export default ResourceDetailPage
