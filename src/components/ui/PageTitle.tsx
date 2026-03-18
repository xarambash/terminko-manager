import type { PageTitleProps } from '../../types'

export function PageTitle({ children, className = '' }: PageTitleProps) {
  return (
    <h1
      className={`text-2xl font-medium text-[var(--text-h)] ${className}`.trim()}
    >
      {children}
    </h1>
  )
}
