import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignServiceToResource,
  createResourceFreeDay,
  createResourceWorkingHour,
  deleteResourceFreeDay,
  deleteResourceWorkingHour,
  fetchResourceFreeDays,
  fetchResourceServices,
  fetchResourceWorkingHours,
  updateResourceWorkingHour,
} from '../api/resourceScheduling'
import { useAuth } from './useAuth'
import type {
  AssignServicePayload,
  CreateFreeDayPayload,
  CreateWorkingHourPayload,
  UpdateWorkingHourPayload,
} from '../types/resourceScheduling'

function schedulingKeys(tenantId: string | undefined, resourceId: string | undefined) {
  return {
    services: ['resourceServices', tenantId, resourceId] as const,
    workingHours: ['resourceWorkingHours', tenantId, resourceId] as const,
    freeDays: ['resourceFreeDays', tenantId, resourceId] as const,
  }
}

export function useResourceServices(resourceId: string | undefined) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: schedulingKeys(tenantId, resourceId).services,
    queryFn: () => fetchResourceServices(tenantId!, resourceId!),
    enabled: Boolean(tenantId && resourceId) && user?.role === 'owner',
  })
}

export function useAssignResourceService(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const keys = schedulingKeys(tenantId, resourceId)

  return useMutation({
    mutationFn: (body: AssignServicePayload) =>
      assignServiceToResource(tenantId!, resourceId!, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.services })
    },
  })
}

export function useResourceWorkingHours(resourceId: string | undefined) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: schedulingKeys(tenantId, resourceId).workingHours,
    queryFn: () => fetchResourceWorkingHours(tenantId!, resourceId!),
    enabled: Boolean(tenantId && resourceId) && user?.role === 'owner',
  })
}

export function useCreateWorkingHour(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const keys = schedulingKeys(tenantId, resourceId)

  return useMutation({
    mutationFn: (body: CreateWorkingHourPayload) =>
      createResourceWorkingHour(tenantId!, resourceId!, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.workingHours })
    },
  })
}

export function useUpdateWorkingHour(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const keys = schedulingKeys(tenantId, resourceId)

  return useMutation({
    mutationFn: ({ workingHourId, body }: { workingHourId: string; body: UpdateWorkingHourPayload }) =>
      updateResourceWorkingHour(tenantId!, resourceId!, workingHourId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.workingHours })
    },
  })
}

export function useDeleteWorkingHour(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const keys = schedulingKeys(tenantId, resourceId)

  return useMutation({
    mutationFn: (workingHourId: string) =>
      deleteResourceWorkingHour(tenantId!, resourceId!, workingHourId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.workingHours })
    },
  })
}

export function useResourceFreeDays(resourceId: string | undefined) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery({
    queryKey: schedulingKeys(tenantId, resourceId).freeDays,
    queryFn: () => fetchResourceFreeDays(tenantId!, resourceId!),
    enabled: Boolean(tenantId && resourceId) && user?.role === 'owner',
  })
}

export function useCreateFreeDay(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const keys = schedulingKeys(tenantId, resourceId)

  return useMutation({
    mutationFn: (body: CreateFreeDayPayload) =>
      createResourceFreeDay(tenantId!, resourceId!, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.freeDays })
    },
  })
}

export function useDeleteFreeDay(resourceId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const keys = schedulingKeys(tenantId, resourceId)

  return useMutation({
    mutationFn: (freeDayId: string) =>
      deleteResourceFreeDay(tenantId!, resourceId!, freeDayId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.freeDays })
    },
  })
}
