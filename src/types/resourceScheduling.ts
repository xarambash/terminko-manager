import type { Service } from './services'

export type ResourceServiceAssignment = {
  id: string
  resourceId: string
  serviceId: string
  price: string | number
  durationOverride: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  service: Service
}

export type ResourceWorkingHour = {
  id: string
  resourceId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
}

export type ResourceFreeDay = {
  id: string
  resourceId: string
  date: string
  reason: string | null
  createdAt: string
}

export type AssignServicePayload = {
  serviceId: string
  price: number
  durationOverride?: number
  isActive?: boolean
}

export type CreateWorkingHourPayload = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type CreateFreeDayPayload = {
  date: string
  reason?: string
}
