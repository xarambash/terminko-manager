import { Group } from '@mantine/core'
import type { ReactNode, CSSProperties } from 'react'
import { ListSearchField } from './ListSearchField'

type PageSearchBarProps = {
  id: string
  value: string
  onChange: (value: string) => void
  actions?: ReactNode
  style?: CSSProperties
}

export function PageSearchBar({ id, value, onChange, actions, style }: PageSearchBarProps) {
  return (
    <Group gap="sm" wrap="wrap" align="flex-end" style={style}>
      <ListSearchField id={id} value={value} onChange={onChange} style={{ flex: 1, minWidth: 200, maxWidth: 'none' }} />
      {actions}
    </Group>
  )
}
