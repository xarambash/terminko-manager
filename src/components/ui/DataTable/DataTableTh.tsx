import { Table, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconSelector } from '@tabler/icons-react'
import type { ThHTMLAttributes } from 'react'
import type { DataTableVariant } from './types'

type DataTableThProps = ThHTMLAttributes<HTMLTableCellElement> & {
  variant: DataTableVariant
  align?: 'left' | 'right'
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

export function DataTableTh({
  variant: _variant,
  align = 'left',
  style,
  sortable,
  sortDirection,
  onSort,
  children,
  ...props
}: DataTableThProps) {
  if (sortable && onSort) {
    const SortIcon =
      sortDirection === 'asc' ? IconChevronUp : sortDirection === 'desc' ? IconChevronDown : IconSelector
    return (
      <Table.Th style={{ textAlign: align, ...style }} {...props}>
        <UnstyledButton
          onClick={onSort}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
            fontSize: 'inherit',
            color: 'inherit',
          }}
        >
          {children}
          <SortIcon size={13} />
        </UnstyledButton>
      </Table.Th>
    )
  }
  return (
    <Table.Th style={{ textAlign: align, ...style }} {...props}>
      {children}
    </Table.Th>
  )
}
