import { useEffect } from 'react'
import { useForm } from '@mantine/form'
import { TextInput, PasswordInput, Button, Paper, Stack, Title, Text } from '@mantine/core'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { AuthLayout } from '../components/ui/AuthLayout'
import { extractServerError } from '../lib/errors'
import type { LoginForm } from '../types'

function LoginFormContent() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const form = useForm<LoginForm>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => {
        if (!v.trim()) return t('login.validation.emailRequired')
        if (!/^\S+@\S+\.\S+$/.test(v)) return t('login.validation.invalidEmail')
        return null
      },
      password: (v) => (!v ? t('login.validation.passwordRequired') : null),
    },
  })

  const onSubmit = form.onSubmit(async (data) => {
    try {
      await login(data.email, data.password)
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/appointments'
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message = extractServerError(err)
      form.setFieldValue('password', '')
      form.setErrors({ email: message ?? t('login.failed') })
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm">
        <Title order={2} mb="xs">{t('login.title')}</Title>
        <TextInput
          label={t('common.email')}
          type="email"
          autoComplete="email"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label={t('common.password')}
          autoComplete="current-password"
          {...form.getInputProps('password')}
        />
        {form.errors.email && !form.values.email && (
          <Text size="sm" c="red">{form.errors.email}</Text>
        )}
        <Button type="submit" loading={form.submitting} mt="xs" fullWidth>
          {t('login.logIn')}
        </Button>
      </Stack>
    </form>
  )
}

function LoginPage() {
  const { i18n } = useTranslation()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/appointments', { replace: true })
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  return (
    <AuthLayout>
      <Paper withBorder shadow="md" p="xl" w="100%" maw={400}>
        <LoginFormContent key={i18n.language} />
      </Paper>
    </AuthLayout>
  )
}

export default LoginPage
