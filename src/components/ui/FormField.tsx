import type { FormFieldProps } from '../../types'

const inputClasses =
  'w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  const inputId = id ?? props.name
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm text-[var(--text)]">{label}</label>
      <input
        id={inputId}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
