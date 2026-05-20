import { api } from './axios'
import type { CreateResourcePayload, UpdateResourcePayload, Resource } from '../types/resources'

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

export async function updateResource(
  tenantId: string,
  resourceId: string,
  body: UpdateResourcePayload
): Promise<Resource> {
  const { data } = await api.patch<Resource>(`/tenants/${tenantId}/resources/${resourceId}`, body)
  return data
}

export async function uploadResourcePhoto(
  tenantId: string,
  resourceId: string,
  file: File
): Promise<Resource> {
  const formData = new FormData()
  formData.append('photo', file)
  const { data } = await api.post<Resource>(
    `/tenants/${tenantId}/resources/${resourceId}/photo`,
    formData,
    { headers: { 'Content-Type': undefined } }
  )
  return data
}

export async function deleteResource(tenantId: string, resourceId: string): Promise<Resource> {
  const { data } = await api.delete<Resource>(`/tenants/${tenantId}/resources/${resourceId}`)
  return data
}
