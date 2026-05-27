export function getTenantSlug(): string {
  // Env variable takes priority — needed when deployed to a platform (e.g. Vercel)
  // where the hostname is not a tenant subdomain (e.g. terminko-manager.vercel.app).
  // When a custom domain with tenant subdomains is set up, remove VITE_TENANT_SLUG
  // and rely on the hostname fallback below.
  const envSlug = import.meta.env.VITE_TENANT_SLUG
  if (envSlug) return envSlug
  return window.location.hostname.split('.')[0] ?? ''
}
