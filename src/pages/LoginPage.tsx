import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout, Button, Card, FormError, FormField, PageTitle } from '../components'
import { extractServerError } from '../lib/errors'
import type { LoginForm } from '../types'

function LoginForm() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, t('login.validation.emailRequired')).email(t('login.validation.invalidEmail')),
        password: z.string().min(1, t('login.validation.passwordRequired')),
      }),
    [t]
  )

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

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message = extractServerError(err)
      setValue('password', '')
      setError('root', { message: message ?? t('login.failed') })
    }
  }

  return (
    <>
      <PageTitle className="mb-6">{t('login.title')}</PageTitle>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label={t('common.email')}
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
        />
        <FormField
          label={t('common.password')}
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
          {isSubmitting ? t('login.loggingIn') : t('login.logIn')}
        </Button>
      </form>
    </>
  )
}

function LoginPage() {
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <LoginForm key={i18n.language} />
      </Card>
    </AuthLayout>
  )
}

export default LoginPage
