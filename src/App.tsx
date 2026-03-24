import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
import ResourcesPage from './pages/ResourcesPage'
import ResourceDetailPage from './pages/ResourceDetailPage'
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
