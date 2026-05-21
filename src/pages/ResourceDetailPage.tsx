import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button, Tabs } from '@mantine/core'
import { Card, PageSectionHeader, QueryStatusBanner } from '../components'
import {
  ResourceFreeDaysSection,
  ResourceServicesSection,
  ResourceSummaryCard,
  ResourceWorkingHoursSection,
} from '../components/ResourceDetail'
import { useResources, useUpdateResource, useUploadResourcePhoto } from '../hooks'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

type ResourceDetailTab = 'profile' | 'services' | 'working-hours' | 'absences'
const DEFAULT_TAB: ResourceDetailTab = 'profile'
const VALID_TABS: ResourceDetailTab[] = ['profile', 'services', 'working-hours', 'absences']

function ResourceDetailPage() {
  const { t } = useTranslation()
  const { resourceId } = useParams<{ resourceId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: resources, isPending, isError, error } = useResources()
  const updateResource = useUpdateResource()
  const uploadPhoto = useUploadResourcePhoto()

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

  return (
    <main className={pageClass}>
      <PageSectionHeader
        showBackLink
        backTo="/resources"
        backLabel={t('nav.backResources')}
      />

      <Tabs
        value={activeTab}
        onChange={(tab) => {
          if (tab) setSearchParams({ tab })
        }}
      >
        <Tabs.List mb="md">
          {tabItems.map((tab) => (
            <Tabs.Tab key={tab.key} value={tab.key}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <QueryStatusBanner isPending={isPending} isError={isError} error={error} loadingText={t('loading.resource')} />

        {notFound && (
          <Card className="p-4 sm:p-6">
            <p className="text-sm">{t('resourceDetail.notFoundBody')}</p>
            <Button mt="sm" onClick={() => navigate('/resources')}>
              {t('resourceDetail.backToResources')}
            </Button>
          </Card>
        )}

        {resource && resourceId && (
          <>
            <Tabs.Panel value="profile">
              <ResourceSummaryCard
                resource={resource}
                onSave={async (fields) => {
                  await updateResource.mutateAsync({
                    id: resourceId,
                    body: {
                      firstName: fields.firstName,
                      lastName: fields.lastName,
                      email: fields.email,
                      phone: fields.phone || null,
                      isActive: fields.isActive,
                    },
                  })
                }}
                onUploadPhoto={async (file) => {
                  await uploadPhoto.mutateAsync({ id: resourceId, file })
                }}
              />
            </Tabs.Panel>
            <Tabs.Panel value="services">
              <ResourceServicesSection resourceId={resourceId} />
            </Tabs.Panel>
            <Tabs.Panel value="working-hours">
              <ResourceWorkingHoursSection resourceId={resourceId} />
            </Tabs.Panel>
            <Tabs.Panel value="absences">
              <ResourceFreeDaysSection resourceId={resourceId} />
            </Tabs.Panel>
          </>
        )}
      </Tabs>
    </main>
  )
}

export default ResourceDetailPage
