import { AppShell, Group, Box } from '@mantine/core'
import type { AuthLayoutProps } from '../../types'
import { TenantBrandName } from '../TenantBrandName'
import { LanguageSwitcher } from './LanguageSwitcher'

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <AppShell header={{ height: 60 }} className={className}>
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <TenantBrandName />
          <LanguageSwitcher />
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Box
          style={{
            minHeight: 'calc(100dvh - 60px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
          }}
        >
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  )
}
