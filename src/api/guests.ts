import { api } from './axios'
import type { Guest } from '../types/guests'

export async function fetchGuests(tenantId: string): Promise<Guest[]> {
  const { data } = await api.get<Guest[]>(`/tenants/${tenantId}/guests`)
  return data
}
