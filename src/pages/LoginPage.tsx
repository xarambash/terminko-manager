import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout, Button, Card, FormError, FormField, PageTitle } from '../components'
import type { LoginForm } from '../types'

const loginSchema = z.object({
  email: z.string().min(1, 'Email je obavezan').email('Neispravan email'),
  password: z.string().min(1, 'Lozinka je obavezna'),
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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
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
    } catch {
      setError('root', { message: 'Prijava nije uspela. Pokušajte ponovo.' })
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm p-8">
        <PageTitle className="mb-6">{t('login.title', 'Prijava')}</PageTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormField
            label="Lozinka"
            id="password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <FormError message={errors.root?.message} />
          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? 'Prijavljivanje...' : 'Prijavi se'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  )
}

export default LoginPage
