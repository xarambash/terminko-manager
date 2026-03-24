import { Link } from 'react-router-dom'
import { PageTitle } from './PageTitle'
import type { PageSectionHeaderProps } from '../../types'

export function PageSectionHeader({
  title,
  backTo = '/',
  backLabel = '← Dashboard',
  actions,
}: PageSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          to={backTo}
          className="text-sm text-[var(--text)] transition hover:text-[var(--text-h)]"
        >
          {backLabel}
        </Link>
        <PageTitle>{title}</PageTitle>
      </div>
      {actions}
    </div>
  )
}
