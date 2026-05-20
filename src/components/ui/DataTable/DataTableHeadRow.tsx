import type { ComponentPropsWithoutRef } from 'react'
import type { DataTableVariant } from './types'

type DataTableHeadRowProps = ComponentPropsWithoutRef<'tr'> & {
  variant: DataTableVariant
}

export function DataTableHeadRow({ variant, className = '', ...props }: DataTableHeadRowProps) {
  const headBg = variant === 'inset' ? ' bg-[var(--code-bg)]' : ''
  return (
    <tr className={`border-b border-zinc-200 dark:border-zinc-800${headBg} ${className}`.trim()} {...props} />
  )
}
