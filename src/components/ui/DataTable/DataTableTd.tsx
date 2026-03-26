import type { TdHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableTdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  variant: DataTableVariant
  align?: 'left' | 'right'
}

export function DataTableTd({
  variant,
  align = 'left',
  className = '',
  ...props
}: DataTableTdProps) {
  const alignClass = align === 'right' ? 'text-right' : 'text-left'
  const base =
    variant === 'page'
      ? `px-3 py-3 ${alignClass} text-sm sm:px-4`
      : `px-3 py-2 ${alignClass}`
  return <td className={`${base} ${className}`.trim()} {...props} />
}
