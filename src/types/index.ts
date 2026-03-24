
export type {
  AppointmentStatus,
  AppointmentWithRelations,
  AppointmentGuest,
  AppointmentResource,
  AppointmentService,
} from './appointments'

import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from 'react'

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

export type ButtonVariant = 'primary' | 'secondary'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
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

export type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  titleId?: string
  children: ReactNode
}

export type CreateResourceModalProps = {
  open: boolean
  onClose: () => void
}
