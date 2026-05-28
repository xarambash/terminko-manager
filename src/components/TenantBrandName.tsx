import { useTranslation } from 'react-i18next'
import { useTenant } from '../hooks/useTenant'

type TenantBrandNameProps = {
  className?: string
}

/** Resolves tenant display name via GET /tenants/:slug; falls back to app name. */
export function TenantBrandName({ className = '' }: TenantBrandNameProps) {
  const { t } = useTranslation()
  const { data: tenant } = useTenant()

  return (
    <span
      className={className}
      style={{ fontFamily: '"Montserrat Alternates", system-ui, sans-serif', fontSize: '1.2rem' }}
    >
      {tenant?.name ?? t('common.appName')}
    </span>
  )
}
