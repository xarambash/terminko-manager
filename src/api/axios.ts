import axios from 'axios'
import { getToken, clearAuth } from '../lib/auth'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      if (!isLoginRequest) {
        clearAuth()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
