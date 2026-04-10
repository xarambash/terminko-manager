import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeftIcon } from 'lucide-react'
import type { PageSectionHeaderProps } from '../../types'

export function PageSectionHeader({
  showBackLink = false,
  backTo = '/appointments',
  backLabel,
  actions,
}: PageSectionHeaderProps) {
  const { t } = useTranslation()
  const backAriaLabel = backLabel ?? t('nav.backAppointments')

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {showBackLink && (
          <Link
            to={backTo}
            className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-[var(--text)] transition hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"
            aria-label={backAriaLabel}
            title={backAriaLabel}
          >
            <ArrowLeftIcon className="size-5" aria-hidden />
          </Link>
        )}
      </div>
      {actions}
    </div>
  )
}
