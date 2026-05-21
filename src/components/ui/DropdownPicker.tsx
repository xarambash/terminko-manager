import { Select } from '@mantine/core'

type DropdownPickerOption = {
  value: string
  label: string
  disabled?: boolean
}

type DropdownPickerProps = {
  value: string
  options: DropdownPickerOption[]
  onValueChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  className?: string
  contentClassName?: string
  align?: 'start' | 'center' | 'end'
  size?: 'default' | 'xs' | 'sm' | 'lg'
  disabled?: boolean
}

export function DropdownPicker({
  value,
  options,
  onValueChange,
  ariaLabel,
  placeholder,
  disabled = false,
}: DropdownPickerProps) {
  return (
    <Select
      value={value || null}
      onChange={(v) => onValueChange(v ?? '')}
      data={options}
      placeholder={placeholder}
      aria-label={ariaLabel}
      disabled={disabled || options.length === 0}
      allowDeselect={false}
      miw={160}
    />
  )
}
