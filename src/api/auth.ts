import { api } from './axios'
import type { ChangePasswordPayload } from '../types'

export async function changePassword(body: ChangePasswordPayload): Promise<void> {
  await api.post('/auth/change-password', body)
}
