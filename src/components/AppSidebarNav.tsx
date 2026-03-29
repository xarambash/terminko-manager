import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@/lib/utils'

const linkBase =
  'group flex w-full items-start gap-3 rounded-xl py-1.5 pr-3 pl-4 text-left text-sm outline-offset-[-1px] transition-colors'

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    linkBase,
    isActive
      ? 'bg-[rgb(14_14_14/0.1)] font-medium text-[#0e0e0e] [text-shadow:-0.2px_0_0_currentColor,0.2px_0_0_currentColor] dark:bg-[rgb(212_162_127/0.12)] dark:text-[#d4a27f]'
      : 'text-[var(--text)] hover:bg-[rgb(0_0_0/0.04)] hover:text-[var(--text-h)] dark:text-[rgb(158_158_158)] dark:hover:bg-[rgb(255_255_255/0.05)] dark:hover:text-[rgb(229_229_229)]',
  )
}

type AppSidebarNavProps = {
  /** Close mobile menu after navigation */
  onNavigate?: () => void
}

export function AppSidebarNav({ onNavigate }: AppSidebarNavProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const owner = user?.role === 'owner'

  return (
    <nav aria-label={t('nav.mainAria')} className="text-sm leading-6">
      <ul className="space-y-px">
        <li>
          <NavLink
            to="/"
            end
            className={sidebarLinkClass}
            onClick={onNavigate}
          >
            {t('nav.dashboard')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/appointments"
            className={sidebarLinkClass}
            onClick={onNavigate}
          >
            {t('nav.appointments')}
          </NavLink>
        </li>
        {owner && (
          <>
            <li>
              <NavLink
                to="/services"
                className={sidebarLinkClass}
                onClick={onNavigate}
              >
                {t('nav.services')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/guests"
                className={sidebarLinkClass}
                onClick={onNavigate}
              >
                {t('nav.guests')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/resources"
                className={sidebarLinkClass}
                onClick={onNavigate}
              >
                {t('nav.resources')}
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
