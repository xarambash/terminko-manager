import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, LogOut, Sparkles, Users, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { cn } from '@/lib/utils'

const linkBase =
  'group flex w-full items-center gap-2.5 border-l-2 py-1 pr-3 pl-3 text-left text-sm transition-colors'

function sidebarLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    linkBase,
    isActive
      ? 'border-[var(--nav-active-text)] font-medium text-[var(--nav-active-text)]'
      : 'border-transparent text-[var(--text)] hover:border-[var(--border)] hover:text-[var(--text-h)]',
  )
}

const sectionLabel = 'mb-1 px-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text)] opacity-50'

type AppSidebarNavProps = {
  onNavigate?: () => void
}

export function AppSidebarNav({ onNavigate }: AppSidebarNavProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const owner = user?.role === 'owner'

  return (
    <div className="flex h-full flex-col">
      <nav aria-label={t('nav.mainAria')} className="text-sm leading-6">
        <p className={sectionLabel}>{t('nav.workspace')}</p>
        <ul className="space-y-px">
          <li>
            <NavLink to="/appointments" end className={sidebarLinkClass} onClick={onNavigate}>
              <CalendarDays className="size-4 shrink-0" aria-hidden />
              {t('nav.appointments')}
            </NavLink>
          </li>
          {owner && (
            <>
              <li>
                <NavLink to="/services" className={sidebarLinkClass} onClick={onNavigate}>
                  <Sparkles className="size-4 shrink-0" aria-hidden />
                  {t('nav.services')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/guests" className={sidebarLinkClass} onClick={onNavigate}>
                  <Users className="size-4 shrink-0" aria-hidden />
                  {t('nav.guests')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/resources" className={sidebarLinkClass} onClick={onNavigate}>
                  <UserRound className="size-4 shrink-0" aria-hidden />
                  {t('nav.resources')}
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => { logout(); onNavigate?.() }}
          className={cn(linkBase, 'border-transparent text-[var(--text)] hover:border-[var(--border)] hover:text-[var(--text-h)]')}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          {t('common.logout')}
        </button>
      </div>
    </div>
  )
}
