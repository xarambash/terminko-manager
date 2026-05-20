import type { ComponentPropsWithoutRef } from 'react'

type DataTableBodyRowProps = ComponentPropsWithoutRef<'tr'> & {
  /** Subtle hover background (list rows). */
  hoverable?: boolean
}

export function DataTableBodyRow({
  hoverable,
  className = '',
  ...props
}: DataTableBodyRowProps) {
  const hover = hoverable ? ' transition hover:bg-muted/40' : ''
  return (
    <tr
      className={`border-b border-zinc-200 dark:border-zinc-800 last:border-b-0${hover} ${className}`.trim()}
      {...props}
    />
  )
}
