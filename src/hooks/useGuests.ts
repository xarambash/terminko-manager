import { useQuery } from '@tanstack/react-query'
import { fetchGuests } from '../api/guests'
import { useAuth } from './useAuth'

export function useGuests() {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: ['guests', tenantId, user?.id],
    queryFn: () => fetchGuests(tenantId!),
    enabled: Boolean(tenantId) && user?.role === 'owner',
  })
}
