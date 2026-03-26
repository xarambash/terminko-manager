import { useTranslation } from 'react-i18next'
import type { AuthLayoutProps } from '../../types'
import { LanguageSwitcher } from './LanguageSwitcher'

export function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className={`flex min-h-screen flex-col ${className}`.trim()}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 sm:px-6">
        <span className="text-sm font-medium text-[var(--text-h)]">{t('common.appName')}</span>
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  )
}
