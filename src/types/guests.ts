export type Guest = {
  id: string
  tenantId: string
  name: string
  email: string
  phone: string
  notes: string | null
  penaltyPoints: number
  isBanned: boolean
  bannedUntil: string | null
  bannedReason: string | null
  createdAt: string
  updatedAt: string
}
