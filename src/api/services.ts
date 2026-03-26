import { api } from './axios'
import type { CreateServicePayload, Service } from '../types/services'

export async function fetchServices(tenantId: string): Promise<Service[]> {
  const { data } = await api.get<Service[]>(`/tenants/${tenantId}/services`)
  return data
}

export async function createService(
  tenantId: string,
  body: CreateServicePayload
): Promise<Service> {
  const { data } = await api.post<Service>(`/tenants/${tenantId}/services`, body)
  return data
}
