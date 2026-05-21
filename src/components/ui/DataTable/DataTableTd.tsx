import { Table } from '@mantine/core'
import type { TdHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableTdProps = TdHTMLAttributes<HTMLTableCellElement> & {
  variant: DataTableVariant
  align?: 'left' | 'right'
}

export function DataTableTd({ variant: _variant, align = 'left', style, ...props }: DataTableTdProps) {
  return (
    <Table.Td
      style={{ textAlign: align, ...style }}
      {...props}
    />
  )
}
