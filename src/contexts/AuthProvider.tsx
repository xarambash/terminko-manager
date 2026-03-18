import { useState, type ReactNode } from 'react'
import { isAuthenticated, setAuth, clearAuth } from '../lib/auth'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated())

  const login = async (email: string, password: string) => {
    // TODO: zamena sa pravim API pozivom - use email, password
    void [email, password]
    setAuth()
    setAuthenticated(true)
  }

  const logout = () => {
    clearAuth()
    setAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: authenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
