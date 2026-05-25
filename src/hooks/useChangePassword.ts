import { useMutation } from '@tanstack/react-query'
import { changePassword } from '../api/auth'
import type { ChangePasswordPayload } from '../types'

export function useChangePassword() {
  return useMutation({
    mutationFn: (body: ChangePasswordPayload) => changePassword(body),
  })
}
