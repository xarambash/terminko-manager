import type { TableHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  variant: DataTableVariant
  /** Minimum table width in pixels (horizontal scroll below this). */
  minWidth: number
}

export function DataTable({ variant, minWidth, className = '', ...props }: DataTableProps) {
  const sizeClass = variant === 'inset' ? ' text-sm' : ''
  return (
    <table
      className={`w-full border-collapse${sizeClass} ${className}`.trim()}
      style={{ minWidth }}
      {...props}
    />
  )
}
