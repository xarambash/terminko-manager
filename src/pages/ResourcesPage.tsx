import { useMemo, useState, type KeyboardEvent } from 'react'
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
  ListSearchField,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useResources } from '../hooks'
import { Trash2 } from 'lucide-react'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function ResourcesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const { data: resources, isPending, isError, error } = useResources()

  const sorted = useMemo(() => {
    const list = [...(resources ?? [])]
    list.sort((a, b) => {
      const an = `${a.firstName} ${a.lastName}`.trim()
      const bn = `${b.firstName} ${b.lastName}`.trim()
      return an.localeCompare(bn)
    })
    return list
  }, [resources])

  const filtered = useMemo(
    () =>
      sorted.filter((r) =>
        matchesTableSearch(search, [r.firstName, r.lastName, r.email ?? '', r.phone ?? ''])
      ),
    [sorted, search]
  )

  return (
    <main className={pageClass}>
      <div className="flex flex-col gap-4">
        <PageSectionHeader
          title={t('resources.title')}
          actions={
            <Button type="button" onClick={() => setModalOpen(true)}>
              {t('resources.createResource')}
            </Button>
          }
        />
        <ListSearchField
          id="resources-search"
          value={search}
          onChange={setSearch}
        />
      </div>

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
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={5}>
                      {t('resources.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={5}>
                      {t('common.emptySearch')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  filtered.map((r) => (
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
                            variant="destructive"
                            size="icon-sm"
                            aria-label={t('services.delete')}
                            title={t('services.delete')}
                          >
                            <Trash2 aria-hidden />
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
