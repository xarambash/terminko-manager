export type Resource = {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  profilePicture: string | null
  email: string | null
  phone: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type CreateResourcePayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  profilePicture?: string
  phone?: string
  isActive?: boolean
  displayOrder?: number
}
