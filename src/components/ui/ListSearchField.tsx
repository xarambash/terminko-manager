import { Input } from '@/components/ui/input'

export type ListSearchFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
}

export function ListSearchField({ id, value, onChange }: ListSearchFieldProps) {
  return (
    <div className="w-full max-w-md">
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        autoComplete="off"
        aria-label="Search"
      />
    </div>
  )
}
