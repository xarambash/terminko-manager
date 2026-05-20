import type { ThHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  variant: DataTableVariant
  align?: 'left' | 'right'
}

export function DataTableTh({
  variant,
  align = 'left',
  className = '',
  ...props
}: DataTableThProps) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'
  const base =
    variant === 'page'
      ? `px-3 py-3 ${alignClass} text-sm font-medium whitespace-nowrap text-[var(--text)] sm:px-4`
      : `px-3 py-2 ${alignClass} font-medium text-[var(--text)]`
  return <th className={`${base} ${className}`.trim()} {...props} />
}
