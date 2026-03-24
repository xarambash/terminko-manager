import { api } from './axios'
import type { Service } from '../types/services'

export async function fetchServices(tenantId: string): Promise<Service[]> {
  const { data } = await api.get<Service[]>(`/tenants/${tenantId}/services`)
  return data
}
