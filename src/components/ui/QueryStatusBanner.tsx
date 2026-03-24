import { formatQueryError } from '../../lib/errors'
import type { QueryStatusBannerProps } from '../../types'

export function QueryStatusBanner({
  isPending,
  isError,
  error,
  loadingText,
}: QueryStatusBannerProps) {
  if (isPending) {
    return (
      <p className="text-sm text-[var(--text)]" role="status">
        {loadingText}
      </p>
    )
  }

  if (isError) {
    const message = formatQueryError(error)
    if (!message) return null
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {message}
      </p>
    )
  }

  return null
}
