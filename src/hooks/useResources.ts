import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createResource, fetchResources } from '../api/resources'
import { useAuth } from './useAuth'
import type { CreateResourcePayload } from '../types/resources'

export function useResources() {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: ['resources', tenantId],
    queryFn: () => fetchResources(tenantId!),
    enabled: Boolean(tenantId) && user?.role === 'owner',
  })
}

export function useCreateResource() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: (body: CreateResourcePayload) => createResource(tenantId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources', tenantId] })
    },
  })
}
