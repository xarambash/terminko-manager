import { Table } from '@mantine/core'
import type { TableHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableProps = TableHTMLAttributes<HTMLTableElement> & {
  variant: DataTableVariant
  minWidth: number
}

export function DataTable({ variant, minWidth, children, ...props }: DataTableProps) {
  return (
    <Table
      style={{ minWidth }}
      fz={variant === 'inset' ? 'sm' : undefined}
      {...(props as object)}
    >
      {children}
    </Table>
  )
}
