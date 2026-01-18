import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './components/Login'
import { SignUp } from './components/SignUp'
import { Dashboard } from './components/Dashboard'
import { DashboardLayout } from './components/DashboardLayout'
import { PaymentLinks } from './components/PaymentLinks'
import { Pay } from './components/Pay'
import './index.css'

// Private Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
      <Route path="/pay" element={<Pay />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Dashboard />} />
        <Route path="payment-links" element={<PaymentLinks />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
