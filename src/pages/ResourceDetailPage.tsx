import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, Card, PageSectionHeader, QueryStatusBanner } from '../components'
import {
  ResourceFreeDaysSection,
  ResourceServicesSection,
  ResourceSummaryCard,
  ResourceWorkingHoursSection,
} from '../components/ResourceDetail'
import { useResources } from '../hooks'
const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'
const tabsClass = 'flex items-center gap-1'

type ResourceDetailTab = 'profile' | 'services' | 'working-hours' | 'absences'
const DEFAULT_TAB: ResourceDetailTab = 'profile'
const VALID_TABS: ResourceDetailTab[] = ['profile', 'services', 'working-hours', 'absences']

function ResourceDetailPage() {
  const { t } = useTranslation()
  const { resourceId } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: resources, isPending, isError, error } = useResources()

  const resource = resourceId ? resources?.find((r) => r.id === resourceId) : undefined
  const listReady = !isPending && !isError && resources != null
  const notFound = listReady && resourceId && !resource

  const activeTab = useMemo<ResourceDetailTab>(() => {
    const param = searchParams.get('tab')
    return param && VALID_TABS.includes(param as ResourceDetailTab)
      ? (param as ResourceDetailTab)
      : DEFAULT_TAB
  }, [searchParams])

  const tabItems = [
    { key: 'profile' as const, label: t('resourceDetail.tabs.profile') },
    { key: 'services' as const, label: t('resourceDetail.tabs.services') },
    { key: 'working-hours' as const, label: t('resourceDetail.tabs.workingHours') },
    { key: 'absences' as const, label: t('resourceDetail.tabs.absences') },
  ]

  const basePath = resourceId ? `/resources/${resourceId}` : '/resources'

  const tabHref = (tab: ResourceDetailTab) => `${basePath}?tab=${tab}`

  return (
    <main className={pageClass}>
      <nav className='flex' aria-label={t('resourceDetail.tabs.navigationLabel')}>
       <PageSectionHeader
        showBackLink
        backTo="/resources"
        backLabel={t('nav.backResources')}
      />
      <div className={tabsClass}>
        {tabItems.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <Link
              key={tab.key}
              to={tabHref(tab.key)}
              className={
                isActive
                  ? '-mb-px rounded-t px-3 py-2 text-sm font-medium border-b-2 border-[var(--text)]'
                  : '-mb-px rounded-t px-3 py-2 text-sm text-[var(--text)] border-b-2 border-transparent hover:text-[var(--text-h)]'
              }
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>

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
          {activeTab === 'profile' && <ResourceSummaryCard resource={resource} />}
          {activeTab === 'services' && <ResourceServicesSection resourceId={resourceId} />}
          {activeTab === 'working-hours' && <ResourceWorkingHoursSection resourceId={resourceId} />}
          {activeTab === 'absences' && <ResourceFreeDaysSection resourceId={resourceId} />}
        </>
      )}
    </main>
  )
}

export default ResourceDetailPage
