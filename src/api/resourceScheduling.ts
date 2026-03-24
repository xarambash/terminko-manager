import { api } from './axios'
import type {
  AssignServicePayload,
  CreateFreeDayPayload,
  CreateWorkingHourPayload,
  ResourceFreeDay,
  ResourceServiceAssignment,
  ResourceWorkingHour,
} from '../types/resourceScheduling'

export async function fetchResourceServices(
  tenantId: string,
  resourceId: string
): Promise<ResourceServiceAssignment[]> {
  const { data } = await api.get<ResourceServiceAssignment[]>(
    `/tenants/${tenantId}/resources/${resourceId}/services`
  )
  return data
}

export async function assignServiceToResource(
  tenantId: string,
  resourceId: string,
  body: AssignServicePayload
): Promise<ResourceServiceAssignment> {
  const { data } = await api.post<ResourceServiceAssignment>(
    `/tenants/${tenantId}/resources/${resourceId}/services`,
    body
  )
  return data
}

export async function fetchResourceWorkingHours(
  tenantId: string,
  resourceId: string
): Promise<ResourceWorkingHour[]> {
  const { data } = await api.get<ResourceWorkingHour[]>(
    `/tenants/${tenantId}/resources/${resourceId}/working-hours`
  )
  return data
}

export async function createResourceWorkingHour(
  tenantId: string,
  resourceId: string,
  body: CreateWorkingHourPayload
): Promise<ResourceWorkingHour> {
  const { data } = await api.post<ResourceWorkingHour>(
    `/tenants/${tenantId}/resources/${resourceId}/working-hours`,
    body
  )
  return data
}

export async function fetchResourceFreeDays(
  tenantId: string,
  resourceId: string
): Promise<ResourceFreeDay[]> {
  const { data } = await api.get<ResourceFreeDay[]>(
    `/tenants/${tenantId}/resources/${resourceId}/free-days`
  )
  return data
}

export async function createResourceFreeDay(
  tenantId: string,
  resourceId: string,
  body: CreateFreeDayPayload
): Promise<ResourceFreeDay> {
  const { data } = await api.post<ResourceFreeDay>(
    `/tenants/${tenantId}/resources/${resourceId}/free-days`,
    body
  )
  return data
}
