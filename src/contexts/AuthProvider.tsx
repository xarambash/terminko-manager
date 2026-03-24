import { useState, type ReactNode } from 'react'
import type { User } from '../types'
import { isAuthenticated, setAuth, clearAuth, getUser } from '../lib/auth'
import { getTenantSlug } from '../lib/tenant'
import { api } from '../api'
import { queryClient } from '../queryClient'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())
  const [user, setUser] = useState<User | null>(() => getUser())

  const login = async (email: string, password: string) => {
    const tenantSlug = getTenantSlug()
    if (!tenantSlug) {
      throw new Error('Tenant not found. Check that VITE_TENANT_SLUG is set for localhost.')
    }

    const { data } = await api.post<{ token: string; user: User }>('/auth/login', {
      tenantSlug,
      email,
      password,
    })

    setAuth(data.token, data.user)
    setUser(data.user)
    setAuthenticated(true)
  }

  const logout = () => {
    queryClient.removeQueries({ queryKey: ['appointments'] })
    clearAuth()
    setUser(null)
    setAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: authenticated, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
