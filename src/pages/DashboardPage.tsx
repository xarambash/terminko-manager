import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { Card, PageTitle } from '../components'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <main className={pageClass}>
      <PageTitle>{t('dashboard.title')}</PageTitle>

      <div className="flex flex-wrap gap-4">
        <Card to="/appointments" className="p-4 sm:p-6">
          <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">
            {t('dashboard.appointmentsTitle')}
          </h2>
          <p className="text-sm text-[var(--text)]">{t('dashboard.appointmentsDesc')}</p>
        </Card>
        {user?.role === 'owner' && (
          <>
            <Card to="/services" className="p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">
                {t('dashboard.servicesTitle')}
              </h2>
              <p className="text-sm text-[var(--text)]">{t('dashboard.servicesDesc')}</p>
            </Card>
            <Card to="/guests" className="p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">
                {t('dashboard.guestsTitle')}
              </h2>
              <p className="text-sm text-[var(--text)]">{t('dashboard.guestsDesc')}</p>
            </Card>
            <Card to="/resources" className="p-4 sm:p-6">
              <h2 className="mb-2 text-lg font-medium text-[var(--text-h)]">
                {t('dashboard.resourcesTitle')}
              </h2>
              <p className="text-sm text-[var(--text)]">{t('dashboard.resourcesDesc')}</p>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}

export default DashboardPage
