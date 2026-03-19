export function getTenantSlug(): string {
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    return import.meta.env.VITE_TENANT_SLUG ?? ''
  }
  return host.split('.')[0] ?? ''
}
