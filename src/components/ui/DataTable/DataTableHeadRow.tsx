import type { ComponentPropsWithoutRef } from 'react'
import type { DataTableVariant } from './types'

type DataTableHeadRowProps = ComponentPropsWithoutRef<'tr'> & {
  variant: DataTableVariant
}

export function DataTableHeadRow({ variant, className = '', ...props }: DataTableHeadRowProps) {
  const headBg = variant === 'inset' ? ' bg-[var(--code-bg)]' : ''
  return (
    <tr className={`border-b border-[var(--border)]${headBg} ${className}`.trim()} {...props} />
  )
}
