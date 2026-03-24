import { isAxiosError } from 'axios'

export function extractServerError(err: unknown): string | undefined {
  if (!err || typeof err !== 'object' || !('response' in err)) return undefined
  const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data
  if (!data || typeof data !== 'object') return undefined
  const msg = data.error ?? data.message ?? data.detail
  return typeof msg === 'string' ? msg : undefined
}

export function formatQueryError(error: unknown): string | null {
  if (!error) return null
  const fromBody = extractServerError(error)
  if (fromBody) return fromBody
  if (isAxiosError(error)) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
