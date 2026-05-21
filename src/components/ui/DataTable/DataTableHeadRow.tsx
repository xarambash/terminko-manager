import { Table } from '@mantine/core'
import type { ComponentPropsWithoutRef } from 'react'
import type { DataTableVariant } from './types'

type DataTableHeadRowProps = ComponentPropsWithoutRef<'tr'> & {
  variant: DataTableVariant
}

export function DataTableHeadRow({ variant: _variant, ...props }: DataTableHeadRowProps) {
  return <Table.Tr {...props} />
}
