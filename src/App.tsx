import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
