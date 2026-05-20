import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createResource, deleteResource, fetchResources, updateResource, uploadResourcePhoto } from '../api/resources'
import { useAuth } from './useAuth'
import type { CreateResourcePayload, UpdateResourcePayload } from '../types/resources'

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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resources', tenantId] })
    },
  })
}

export function useUpdateResource() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateResourcePayload }) =>
      updateResource(tenantId!, id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resources', tenantId] })
    },
  })
}

export function useUploadResourcePhoto() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadResourcePhoto(tenantId!, id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resources', tenantId] })
    },
  })
}

export function useDeleteResource() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useMutation({
    mutationFn: (resourceId: string) => deleteResource(tenantId!, resourceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resources', tenantId] })
    },
  })
}
