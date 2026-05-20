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
  start_date: string
  end_date: string | null
  reason: string | null
  createdAt: string
}

// Server v1 shape (before terminko-server#8); Prisma returns camelCase (startDate/endDate)
type LegacyResourceFreeDay = Omit<ResourceFreeDay, 'start_date' | 'end_date'> & {
  date?: string
  start_date?: string
  end_date?: string | null
  startDate?: string | Date
  endDate?: string | Date | null
}

function toDateString(v: string | Date | undefined | null): string | undefined {
  if (!v) return undefined
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return v.includes('T') ? v.slice(0, 10) : v
}

export function normalizeResourceFreeDay(raw: LegacyResourceFreeDay): ResourceFreeDay {
  return {
    id: raw.id,
    resourceId: raw.resourceId,
    start_date: toDateString(raw.start_date ?? raw.startDate ?? raw.date) ?? '',
    end_date: toDateString(raw.end_date ?? raw.endDate) ?? null,
    reason: raw.reason,
    createdAt: raw.createdAt,
  }
}

export type AssignServicePayload = {
  serviceId: string
  price: number
  durationOverride?: number
  isActive?: boolean
}

export type UpdateResourceServicePayload = {
  price?: number
  durationOverride?: number | null
}

export type CreateWorkingHourPayload = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type UpdateWorkingHourPayload = {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export type CreateFreeDayPayload = {
  start_date: string
  end_date?: string
  reason?: string
}
