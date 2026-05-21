import { Table } from '@mantine/core'
import type { ReactNode, TdHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableEmptyCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  variant: DataTableVariant
  colSpan: number
  children: ReactNode
}

export function DataTableEmptyCell({ variant: _variant, colSpan, children, ...props }: DataTableEmptyCellProps) {
  return (
    <Table.Td
      colSpan={colSpan}
      ta="center"
      py="xl"
      c="dimmed"
      fz="sm"
      {...props}
    >
      {children}
    </Table.Td>
  )
}
