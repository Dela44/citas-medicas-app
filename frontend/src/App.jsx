import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { ToastProvider } from './components/ui/Toast'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Citas from './pages/Citas'
import Pacientes from './pages/Pacientes'
import Historias from './pages/Historias'
import Medicos from './pages/Medicos'
import Facturacion from './pages/Facturacion'

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/citas" element={<Citas />} />
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/historias" element={<Historias />} />
              <Route path="/medicos" element={<Medicos />} />
              <Route path="/facturacion" element={<Facturacion />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  )
}
