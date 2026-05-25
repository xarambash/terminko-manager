
export type {
  AppointmentStatus,
  AppointmentWithRelations,
  AppointmentGuest,
  AppointmentResource,
  AppointmentService,
} from './appointments'

export type { Service, CreateServicePayload, UpdateServicePayload } from './services'
export type { Resource, CreateResourcePayload, UpdateResourcePayload } from './resources'
export type { Guest } from './guests'
export type { Tenant } from './tenant'
export type {
  ResourceServiceAssignment,
  ResourceWorkingHour,
  ResourceFreeDay,
  AssignServicePayload,
  UpdateResourceServicePayload,
  CreateWorkingHourPayload,
  UpdateWorkingHourPayload,
  CreateFreeDayPayload,
} from './resourceScheduling'

import type React from 'react'
import type { ReactNode } from 'react'

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'staff'
  tenantId: string
  resourceId: string | null
  profilePicture: string | null
}

export type AuthContextValue = {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export type ProtectedRouteProps = {
  children: ReactNode
}

export type LoginForm = {
  email: string
  password: string
}


export type CardProps = {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  to?: string
}

export type PageTitleProps = {
  children: ReactNode
  className?: string
}

export type FormErrorProps = {
  message?: string
}

export type AuthLayoutProps = {
  children: ReactNode
  className?: string
}

export type PageSectionHeaderProps = {
  title?: string
  showBackLink?: boolean
  backTo?: string
  backLabel?: string
  actions?: ReactNode
}

export type QueryStatusBannerProps = {
  isPending: boolean
  isError: boolean
  error: unknown
  loadingText: string
}

export type CreateResourceModalProps = {
  open: boolean
  onClose: () => void
}

export type CreateServiceModalProps = {
  open: boolean
  onClose: () => void
}

export type EditServiceModalProps = {
  open: boolean
  onClose: () => void
  service: import('./services').Service | null
}

export type DeleteServiceConfirmModalProps = {
  open: boolean
  onClose: () => void
  serviceName: string
  onConfirm: () => void
  isPending?: boolean
}

export type DeleteResourceConfirmModalProps = {
  open: boolean
  onClose: () => void
  resourceName: string
  onConfirm: () => void
  isPending?: boolean
}

export type GuestActionPlaceholderModalProps = {
  open: boolean
  onClose: () => void
  guestName: string
  action: 'ban' | 'unban'
}

export type CancelAppointmentConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isPending: boolean
  guestName: string
  serviceName: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type ChangePasswordModalProps = {
  open: boolean
  onClose: () => void
}
