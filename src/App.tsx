import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import {
  LoginPage,
  AppointmentsPage,
  ResourcesPage,
  ResourceDetailPage,
  ServicesPage,
  // GuestsPage, // re-enable with Guests route
} from './pages'
import { OwnerRoute } from './components/OwnerRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/appointments" replace />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route
          path="services"
          element={
            <OwnerRoute>
              <ServicesPage />
            </OwnerRoute>
          }
        />
        {/* Guests route — temporarily disabled; uncomment to re-enable
        <Route
          path="guests"
          element={
            <OwnerRoute>
              <GuestsPage />
            </OwnerRoute>
          }
        />
        */}
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
      <Route path="*" element={<Navigate to="/appointments" replace />} />
    </Routes>
  )
}

export default App
