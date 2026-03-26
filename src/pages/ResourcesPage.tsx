import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  CreateResourceModal,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { useResources } from '../hooks'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function ResourcesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const { data: resources, isPending, isError, error } = useResources()

  return (
    <main className={pageClass}>
      <PageSectionHeader
        title={t('resources.title')}
        actions={
          <Button type="button" onClick={() => setModalOpen(true)}>
            {t('resources.createResource')}
          </Button>
        }
      />

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.resources')}
      />

      {!isPending && !isError && (
        <Card className="overflow-hidden p-0">
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={640}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page">{t('common.name')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.email')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.phone')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.active')}</DataTableTh>
                  <DataTableTh variant="page" align="right">
                    {t('common.actions')}
                  </DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {(resources ?? []).length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={5}>
                      {t('resources.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  (resources ?? []).map((r) => (
                    <DataTableBodyRow
                      key={r.id}
                      hoverable
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer"
                      onClick={() => navigate(`/resources/${r.id}`)}
                      onKeyDown={(e: KeyboardEvent<HTMLTableRowElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/resources/${r.id}`)
                        }
                      }}
                    >
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {r.firstName} {r.lastName}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {r.email ?? t('common.dash')}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {r.phone ?? t('common.dash')}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {r.isActive ? t('common.yes') : t('common.no')}
                      </DataTableTd>
                      <DataTableTd variant="page" align="right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled
                            title={t('resources.deleteTitle')}
                            className="px-3 py-1.5 text-xs"
                          >
                            {t('resources.delete')}
                          </Button>
                        </div>
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>
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
