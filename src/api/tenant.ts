import { api } from './axios'
import type { Tenant } from '../types/tenant'

export async function fetchTenantBySlug(slug: string): Promise<Tenant> {
  const { data } = await api.get<Tenant>(`/tenants/${encodeURIComponent(slug)}`)
  return data
}
