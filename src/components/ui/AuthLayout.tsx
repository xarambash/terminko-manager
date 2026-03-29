import type { AuthLayoutProps } from '../../types'
import { TenantBrandName } from '../TenantBrandName'
import { LanguageSwitcher } from './LanguageSwitcher'

export function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col bg-[var(--bg)] antialiased ${className}`.trim()}>
      <header className="border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-md supports-backdrop-filter:bg-[var(--header-bg)]">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-3 px-4 lg:px-8">
          <TenantBrandName className="text-sm font-semibold tracking-tight text-[var(--text-h)]" />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  )
}
