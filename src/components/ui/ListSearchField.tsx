import { TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import type { CSSProperties } from 'react'

export type ListSearchFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
  containerClassName?: string
  inputClassName?: string
  style?: CSSProperties
}

export function ListSearchField({ id, value, onChange, style }: ListSearchFieldProps) {
  return (
    <TextInput
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search..."
      leftSection={<IconSearch size={14} />}
      style={{ maxWidth: 400, ...style }}
      autoComplete="off"
      aria-label="Search"
    />
  )
}
