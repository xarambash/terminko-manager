import { useQuery } from '@tanstack/react-query'
import { fetchServices } from '../api/services'
import { useAuth } from './useAuth'

export function useServices() {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: ['services', tenantId],
    queryFn: () => fetchServices(tenantId!),
    enabled: Boolean(tenantId) && user?.role === 'owner',
  })
}
