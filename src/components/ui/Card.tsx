import { Link } from 'react-router-dom'
import type { CardProps } from '../../types'

const baseClasses =
  'rounded-lg border border-[var(--border)] bg-[var(--code-bg)] transition'

export function Card({ children, className = '', to }: CardProps) {
  const classes = `${baseClasses} ${to ? 'hover:border-[var(--accent-border)]' : ''} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return <div className={classes}>{children}</div>
}
