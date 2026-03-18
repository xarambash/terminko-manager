import type { ButtonProps, ButtonVariant } from '../../types'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'rounded bg-[var(--accent)] px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-50',
  secondary:
    'rounded border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--code-bg)]',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
