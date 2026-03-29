import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/Button'
import { LanguageSwitcher } from './ui/LanguageSwitcher'
import { AppSidebarNav } from './AppSidebarNav'
import { TenantBrandName } from './TenantBrandName'

export function AppHeader() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-md supports-backdrop-filter:bg-[var(--header-bg)]">
        <div className="mx-auto flex h-16 min-w-0 max-w-[90rem] items-center gap-4 px-4 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-app-nav"
            aria-label={t('nav.openMenu')}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Menu className="size-5 text-[var(--text)]" />
          </Button>
          <Link
            to="/appointments"
            className="min-w-0 shrink-0 text-sm font-semibold tracking-tight text-[var(--text-h)] no-underline hover:opacity-90"
          >
            <TenantBrandName />
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <Button type="button" variant="outline" size="sm" onClick={logout}>
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/25 lg:hidden"
            aria-label={t('nav.closeMenu')}
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-app-nav"
            className="fixed inset-x-0 top-16 z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--bg)] px-2 py-4 shadow-lg lg:hidden"
          >
            <AppSidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  )
}
