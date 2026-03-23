import { useQuery } from '@tanstack/react-query'
import { fetchAppointments } from '../api/appointments'
import type { AppointmentWithRelations } from '../types/appointments'
import { useAuth } from './useAuth'

export function useAppointments() {
  const { user } = useAuth()
  const tenantId = user?.tenantId

  return useQuery<AppointmentWithRelations[]>({
    queryKey: ['appointments', tenantId],
    queryFn: () => fetchAppointments(tenantId!),
    enabled: Boolean(tenantId),
  })
}
