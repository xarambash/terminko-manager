import type { ReactNode } from 'react'
import type { DataTableVariant } from './types'

const scrollWrapperClass: Record<DataTableVariant, string> = {
  page: 'overflow-x-auto',
  inset: 'overflow-x-auto rounded border border-[var(--border)]',
}

type DataTableScrollProps = {
  variant: DataTableVariant
  children: ReactNode
  className?: string
}

export function DataTableScroll({ variant, children, className = '' }: DataTableScrollProps) {
  return (
    <div className={`${scrollWrapperClass[variant]} ${className}`.trim()}>{children}</div>
  )
}
