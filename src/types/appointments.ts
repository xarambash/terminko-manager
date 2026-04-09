/** Aligns with GET /tenants/:tenantId/appointments (API-Reference.md). */

export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled'

export type AppointmentGuest = {
  id: string
  name: string
  email: string
  phone: string
}

export type AppointmentResource = {
  id: string
  firstName: string
  lastName: string
}

export type AppointmentService = {
  id: string
  name: string
  durationMinutes: number
}

export type AppointmentWithRelations = {
  id: string
  resourceId: string
  serviceId: string
  guestId: string
  startAt: string
  endAt: string
  status: AppointmentStatus | string
  priceAtBooking?: string | null
  notes?: string | null
  resource: AppointmentResource
  service: AppointmentService
  guest: AppointmentGuest
}

export type ListAppointmentsParams = {
  date: string
  resourceId?: string
}