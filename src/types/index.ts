// Shared TypeScript types and interfaces

import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
} from 'react'

export type AuthContextValue = {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

export type Appointment = {
  id: string
  date: string
  time: string
  clientName: string
  clientPhone?: string
  service: string
  status: AppointmentStatus
  notes?: string
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
