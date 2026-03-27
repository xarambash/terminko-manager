
export type {
  AppointmentStatus,
  AppointmentWithRelations,
  AppointmentGuest,
  AppointmentResource,
  AppointmentService,
} from './appointments'

export type { Service, CreateServicePayload } from './services'
export type { Guest } from './guests'
export type {
  ResourceServiceAssignment,
  ResourceWorkingHour,
  ResourceFreeDay,
  AssignServicePayload,
  CreateWorkingHourPayload,
  CreateFreeDayPayload,
} from './resourceScheduling'

import type { ReactNode, InputHTMLAttributes } from 'react'

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'owner' | 'staff'
  tenantId: string
  resourceId: string | null
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

export type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export type CardProps = {
  children: ReactNode
  className?: string
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
  title: ReactNode
  /** When true, shows icon-only back control (e.g. resource detail → resources list). Omit on top-level nav pages. */
  showBackLink?: boolean
  backTo?: string
  /** Used for `aria-label` (and optional tooltip) on the back control; not shown as visible text. */
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
}

export type GuestActionPlaceholderModalProps = {
  open: boolean
  onClose: () => void
  guestName: string
  action: 'ban' | 'unban'
}
