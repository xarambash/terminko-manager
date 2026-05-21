import { ScrollArea } from '@mantine/core'
import type { ReactNode } from 'react'
import type { DataTableVariant } from './types'

type DataTableScrollProps = {
  variant: DataTableVariant
  children: ReactNode
  className?: string
}

export function DataTableScroll({ variant, children, className }: DataTableScrollProps) {
  return (
    <ScrollArea
      style={variant === 'inset' ? { borderRadius: 'var(--mantine-radius-sm)', border: '1px solid var(--mantine-color-default-border)' } : undefined}
      className={className}
    >
      {children}
    </ScrollArea>
  )
}
