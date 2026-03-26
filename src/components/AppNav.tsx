import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/Button'
import { LanguageSwitcher } from './ui/LanguageSwitcher'

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'whitespace-nowrap border-b-2 pb-1 text-sm font-medium transition',
    isActive
      ? 'border-[var(--accent)] text-[var(--text-h)]'
      : 'border-transparent text-[var(--text)] hover:text-[var(--text-h)]',
  ].join(' ')
}

export function AppNav() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const owner = user?.role === 'owner'

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 sm:px-6">
      <nav
        className="flex flex-wrap items-center gap-x-6 gap-y-2"
        aria-label={t('nav.mainAria')}
      >
        <NavLink to="/" end className={navClass}>
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to="/appointments" className={navClass}>
          {t('nav.appointments')}
        </NavLink>
        {owner && (
          <>
            <NavLink to="/services" className={navClass}>
              {t('nav.services')}
            </NavLink>
            <NavLink to="/resources" className={navClass}>
              {t('nav.resources')}
            </NavLink>
          </>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Button type="button" variant="outline" size="sm" onClick={logout}>
            {t('common.logout')}
          </Button>
        </div>
      </nav>
    </header>
  )
}
