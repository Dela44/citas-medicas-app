import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import AuthPage from './pages/AuthPage'
import PatientPortal from './pages/PatientPortal'
import Dashboard from './pages/Dashboard'
import Citas from './pages/Citas'
import Pacientes from './pages/Pacientes'
import Historias from './pages/Historias'
import Medicos from './pages/Medicos'
import Facturacion from './pages/Facturacion'
import HomePage from './pages/HomePage'

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <div className="api-state">Verificando sesión...</div>
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function RequireAdmin() {
  const { user } = useAuth()
  return user?.rol === 'ADMIN' ? <Outlet /> : <Navigate to="/portal" replace />
}

function RequirePatient() {
  const { user } = useAuth()
  return user?.rol === 'PACIENTE' ? <PatientPortal /> : <Navigate to="/dashboard" replace />
}

function PublicOnly() {
  const { user, loading } = useAuth()
  if (loading) return <div className="api-state">Verificando sesión...</div>
  return user ? <Navigate to={user.rol === 'ADMIN' ? '/dashboard' : '/portal'} replace /> : <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<PublicOnly />}>
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/registro" element={<AuthPage mode="register" />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/portal" element={<RequirePatient />} />
              <Route element={<RequireAdmin />}>
                <Route element={<StoreProvider><Layout /></StoreProvider>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/citas" element={<Citas />} />
                  <Route path="/pacientes" element={<Pacientes />} />
                  <Route path="/historias" element={<Historias />} />
                  <Route path="/medicos" element={<Medicos />} />
                  <Route path="/facturacion" element={<Facturacion />} />
                </Route>
              </Route>
            </Route>
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
