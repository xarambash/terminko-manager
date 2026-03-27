import { Input } from '@/components/ui/input'

export type ListSearchFieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function ListSearchField({ id, label, placeholder, value, onChange }: ListSearchFieldProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-1">
      <label htmlFor={id} className="text-xs text-[var(--text)]">
        {label}
      </label>
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-label={label}
      />
    </div>
  )
}
