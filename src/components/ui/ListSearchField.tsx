import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type ListSearchFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
  containerClassName?: string
  inputClassName?: string
}

export function ListSearchField({
  id,
  value,
  onChange,
  containerClassName,
  inputClassName,
}: ListSearchFieldProps) {
  return (
    <div className={cn('w-full max-w-md', containerClassName)}>
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        autoComplete="off"
        aria-label="Search"
        className={inputClassName}
      />
    </div>
  )
}
