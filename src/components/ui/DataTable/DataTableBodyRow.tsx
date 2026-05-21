import { Table } from '@mantine/core'
import type { ComponentPropsWithoutRef } from 'react'

type DataTableBodyRowProps = ComponentPropsWithoutRef<'tr'> & {
  hoverable?: boolean
}

export function DataTableBodyRow({ hoverable, ...props }: DataTableBodyRowProps) {
  return <Table.Tr data-hoverable={hoverable || undefined} {...props} />
}
