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
