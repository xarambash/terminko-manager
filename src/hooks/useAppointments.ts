import { useQuery } from '@tanstack/react-query'
import { fetchAppointments } from '../api/appointments'
import type { AppointmentWithRelations, ListAppointmentsParams } from '../types/appointments'
import { useAuth } from './useAuth'

export function useAppointments(params: ListAppointmentsParams, enabled = true) {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery<AppointmentWithRelations[]>({
    queryKey: ['appointments', tenantId, user?.id, params.date, params.resourceId ?? null],
    queryFn: () => fetchAppointments(tenantId!, params),
    enabled: Boolean(tenantId) && Boolean(params.date) && enabled,
  })
}
