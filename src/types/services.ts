export type Service = {
  id: string
  tenantId: string
  name: string
  durationMinutes: number
  description: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

/** Body for POST /tenants/:tenantId/services */
export type CreateServicePayload = {
  name: string
  durationMinutes: number
  description?: string
  isActive?: boolean
  sortOrder?: number
}

/** Body for PATCH /tenants/:tenantId/services/:serviceId — at least one field required */
export type UpdateServicePayload = {
  name?: string
  durationMinutes?: number
  description?: string | null
  isActive?: boolean
  sortOrder?: number
}
