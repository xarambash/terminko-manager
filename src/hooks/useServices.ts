import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createService, deleteService, fetchServices, updateService } from '../api/services'
import { useAuth } from './useAuth'
import type { CreateServicePayload, UpdateServicePayload } from '../types/services'

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services', tenantId] })
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: ({ serviceId, body }: { serviceId: string; body: UpdateServicePayload }) =>
      updateService(tenantId!, serviceId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services', tenantId] })
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: (serviceId: string) => deleteService(tenantId!, serviceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['services', tenantId] })
    },
  })
}
