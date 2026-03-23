import { api } from './axios'
import type { AppointmentWithRelations, ListAppointmentsParams } from '../types/appointments'

export async function fetchAppointments(
  tenantId: string,
  params?: ListAppointmentsParams
): Promise<AppointmentWithRelations[]> {
  const { data } = await api.get<AppointmentWithRelations[]>(
    `/tenants/${tenantId}/appointments`,
    { params }
  )
  return data
}
