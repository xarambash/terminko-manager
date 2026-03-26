import type { ReactNode, TdHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableEmptyCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  variant: DataTableVariant
  colSpan: number
  children: ReactNode
}

export function DataTableEmptyCell({
  variant,
  colSpan,
  className = '',
  children,
  ...props
}: DataTableEmptyCellProps) {
  const padding = variant === 'page' ? 'px-3 py-8 sm:px-4' : 'px-3 py-6'
  return (
    <td
      colSpan={colSpan}
      className={`${padding} text-center text-sm text-[var(--text)] ${className}`.trim()}
      {...props}
    >
      {children}
    </td>
  )
}
