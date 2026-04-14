import { api } from './axios'
import type { CreateServicePayload, UpdateServicePayload, Service } from '../types/services'

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

export async function updateService(
  tenantId: string,
  serviceId: string,
  body: UpdateServicePayload
): Promise<Service> {
  const { data } = await api.patch<Service>(`/tenants/${tenantId}/services/${serviceId}`, body)
  return data
}

export async function deleteService(tenantId: string, serviceId: string): Promise<Service> {
  const { data } = await api.delete<Service>(`/tenants/${tenantId}/services/${serviceId}`)
  return data
}
