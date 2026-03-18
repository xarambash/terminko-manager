import type { AuthLayoutProps } from '../../types'

export function AuthLayout({ children, className = '' }: AuthLayoutProps) {
  return (
    <main
      className={`flex min-h-[80vh] flex-col items-center justify-center px-4 ${className}`.trim()}
    >
      {children}
    </main>
  )
}
