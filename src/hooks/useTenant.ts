import { useQuery } from '@tanstack/react-query'
import { fetchTenantBySlug } from '../api/tenant'
import { getTenantSlug } from '../lib/tenant'
import type { Tenant } from '../types/tenant'

export function useTenant() {
  const slug = getTenantSlug()

  return useQuery<Tenant>({
    queryKey: ['tenant', 'bySlug', slug],
    queryFn: () => fetchTenantBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
  })
}
