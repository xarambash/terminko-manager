import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout, Button, Card, FormError, FormField, PageTitle } from '../components'
import { extractServerError } from '../lib/errors'
import type { LoginForm } from '../types'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

function LoginPage() {
  const { t } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message = extractServerError(err)
      setValue('password', '')
      setError('root', { message: message ?? 'Login failed. Please try again.' })
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm p-8">
        <PageTitle className="mb-6">{t('login.title', 'Login')}</PageTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
          />
          <FormField
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
          <FormError
            message={
              errors.root?.message ??
              errors.email?.message ??
              errors.password?.message
            }
          />
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default LoginPage
