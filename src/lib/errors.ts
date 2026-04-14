import { isAxiosError } from 'axios'

/** Exact `error` strings from terminko-server (DELETE 409 conflict). */
export const API_ERROR_RESOURCE_DELETE_CONFLICT =
  'Cannot delete resource: there are future scheduled appointments for this resource' as const
export const API_ERROR_SERVICE_DELETE_CONFLICT =
  'Cannot delete service: there are future scheduled appointments for this service' as const

export type ApiErrorTranslate = (key: string) => string

export function extractServerError(err: unknown): string | undefined {
  if (!err || typeof err !== 'object' || !('response' in err)) return undefined
  const data = (err as { response?: { data?: Record<string, unknown> } }).response?.data
  if (!data || typeof data !== 'object') return undefined
  const msg = data.error ?? data.message ?? data.detail
  return typeof msg === 'string' ? msg : undefined
}

/** Prefer i18n for known API errors; otherwise raw server text; then fallback translation key. */
export function apiErrorMessageForMutation(
  err: unknown,
  t: ApiErrorTranslate,
  fallbackKey: string
): string {
  const raw = extractServerError(err)
  if (raw === API_ERROR_RESOURCE_DELETE_CONFLICT) {
    return t('deleteResource.errorConflictAppointments')
  }
  if (raw === API_ERROR_SERVICE_DELETE_CONFLICT) {
    return t('deleteService.errorConflictAppointments')
  }
  if (raw) return raw
  return t(fallbackKey)
}

export function formatQueryError(error: unknown): string | null {
  if (!error) return null
  const fromBody = extractServerError(error)
  if (fromBody) return fromBody
  if (isAxiosError(error)) return error.message
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
