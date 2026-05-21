import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { DatesProvider } from '@mantine/dates'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import 'dayjs/locale/sr'
import { AuthProvider } from './contexts/AuthProvider'
import { queryClient } from './queryClient'
import { theme } from './theme'
import './lib/i18n'
import './index.css'
import App from './App.tsx'

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'terminko-manager-color-scheme',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} colorSchemeManager={colorSchemeManager} defaultColorScheme="auto">
      <Notifications position="top-center" />
      <DatesProvider settings={{ locale: 'en' }}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </DatesProvider>
    </MantineProvider>
  </StrictMode>,
)
