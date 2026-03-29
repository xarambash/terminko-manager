/** GET /tenants/:slug — api_reference.md §3 */
export type Tenant = {
  id: string
  name: string
  slug: string
  type: string
  timezone: string
  currency: string
  defaultLanguage: string
}
