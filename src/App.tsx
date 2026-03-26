import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
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

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route
          path="services"
          element={
            <OwnerRoute>
              <ServicesPage />
            </OwnerRoute>
          }
        />
        <Route
          path="resources"
          element={
            <OwnerRoute>
              <ResourcesPage />
            </OwnerRoute>
          }
        />
        <Route
          path="resources/:resourceId"
          element={
            <OwnerRoute>
              <ResourceDetailPage />
            </OwnerRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
