import { ScrollArea } from '@mantine/core'
import type { ReactNode } from 'react'
import type { DataTableVariant } from './types'

type DataTableScrollProps = {
  variant: DataTableVariant
  children: ReactNode
  className?: string
  height?: number | string
}

export function DataTableScroll({ variant, children, className, height }: DataTableScrollProps) {
  return (
    <ScrollArea
      mah={height}
      style={variant === 'inset' ? { borderRadius: 'var(--mantine-radius-sm)', border: '1px solid var(--mantine-color-default-border)' } : undefined}
      className={className}
    >
      {children}
    </ScrollArea>
  )
}
