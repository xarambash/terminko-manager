import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import {
  LoginPage,
  DashboardPage,
  AppointmentsPage,
  ResourcesPage,
  ResourceDetailPage,
  ServicesPage,
} from './pages'
import { OwnerRoute } from './components/OwnerRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>
        }
      />
      <Route
        path="/appointments"
        element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <OwnerRoute>
              <ServicesPage />
            </OwnerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <OwnerRoute>
              <ResourcesPage />
            </OwnerRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:resourceId"
        element={
          <ProtectedRoute>
            <OwnerRoute>
              <ResourceDetailPage />
            </OwnerRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
