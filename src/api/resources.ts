import { api } from './axios'
import type { CreateResourcePayload, Resource } from '../types/resources'

export async function fetchResources(tenantId: string): Promise<Resource[]> {
  const { data } = await api.get<Resource[]>(`/tenants/${tenantId}/resources`)
  return data
}

export async function createResource(
  tenantId: string,
  body: CreateResourcePayload
): Promise<Resource> {
  const { data } = await api.post<Resource>(`/tenants/${tenantId}/resources`, body)
  return data
}
