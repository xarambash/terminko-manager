import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  CreateResourceModal,
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.name')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.email')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.phone')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.active')}
                  </th>
                  <th className="px-3 py-3 text-right text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(resources ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-sm text-[var(--text)] sm:px-4"
                    >
                      {t('resources.empty')}
                    </td>
                  </tr>
                ) : (
                  (resources ?? []).map((r) => (
                    <tr
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--bg)]"
                      onClick={() => navigate(`/resources/${r.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          navigate(`/resources/${r.id}`)
                        }
                      }}
                    >
                      <td className="px-3 py-3 text-sm text-[var(--text-h)] sm:px-4">
                        {r.firstName} {r.lastName}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text)] sm:px-4">
                        {r.email ?? t('common.dash')}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text)] sm:px-4">
                        {r.phone ?? t('common.dash')}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text)] sm:px-4">
                        {r.isActive ? t('common.yes') : t('common.no')}
                      </td>
                      <td className="px-3 py-3 text-right sm:px-4">
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
