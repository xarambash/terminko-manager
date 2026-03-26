import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createService, fetchServices } from '../api/services'
import { useAuth } from './useAuth'
import type { CreateServicePayload } from '../types/services'

export function useServices() {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: ['services', tenantId],
    queryFn: () => fetchServices(tenantId!),
    enabled: Boolean(tenantId) && user?.role === 'owner',
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: (body: CreateServicePayload) => createService(tenantId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['services', tenantId] })
    },
  })
}
