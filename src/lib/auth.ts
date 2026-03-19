import type { User } from '../types'

const AUTH_KEY = 'terminko-auth'
const AUTH_TOKEN_KEY = 'terminko-token'
const AUTH_USER_KEY = 'terminko-user'

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getUser(): User | null {
  const json = localStorage.getItem(AUTH_USER_KEY)
  if (!json) return null
  try {
    return JSON.parse(json) as User
  } catch {
    return null
  }
}

export function setAuth(token: string, user: User): void {
  localStorage.setItem(AUTH_KEY, 'true')
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}
