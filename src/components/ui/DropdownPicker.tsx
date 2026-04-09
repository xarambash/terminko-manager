import { ChevronDownIcon } from 'lucide-react'
import { Button } from './Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

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
  className = '',
  contentClassName = '',
  align = 'end',
  size = 'sm',
  disabled = false,
}: DropdownPickerProps) {
  const selectedOption = options.find((option) => option.value === value)
  const triggerLabel = selectedOption?.label ?? placeholder ?? ''
  const isDisabled = disabled || options.length === 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          aria-label={ariaLabel}
          className={`justify-between gap-2 ${className}`.trim()}
          disabled={isDisabled}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={`min-w-32 ${contentClassName}`.trim()}>
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
