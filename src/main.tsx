import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthProvider'
import { queryClient } from './queryClient'
import { syncHtmlDarkClassFromSystem } from './lib/syncHtmlDarkClass'
import './lib/i18n'
import './index.css'
import App from './App.tsx'

syncHtmlDarkClassFromSystem()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

//    "email": "ana@salon.rs",
//    "password": "privremena123",
