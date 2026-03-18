const AUTH_KEY = 'terminko-auth'

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY)
}

export function setAuth(): void {
  localStorage.setItem(AUTH_KEY, 'true')
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}
