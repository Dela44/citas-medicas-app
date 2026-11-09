import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import logoIcon from '../../assets/logo-tusalud-icon.png'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../ui/Toast'
import { ROUTES } from '../../data/routes'

export default function Layout() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const toast = useToast()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = ROUTES.find((r) => r.path === pathname) || ROUTES[0]

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.title = `${current.label} | Centro Médico SENATI`
  }, [current])

  useEffect(() => {
    const t = setTimeout(() => toast.success('Bienvenido al Sistema de Gestión Médica SENATI - Sede Lima Norte'), 600)
    return () => clearTimeout(t)
  }, [toast])

  const toggleSidebar = () => {
    if (window.innerWidth <= 992) setMobileOpen((v) => !v)
    else setCollapsed((v) => !v)
  }

  const sections = [...new Set(ROUTES.map((r) => r.section))]

  return (
    <div className={`app-container ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar__header">
          <NavLink to="/dashboard" className="sidebar__brand">
            <img src={logoIcon} alt="TUSALUD" className="sidebar__brand-logo-img" />
            <div className="sidebar__brand-text">
              <span>TUSALUD</span>
              <br />
              <span className="sidebar__badge">Gestión Médica</span>
            </div>
          </NavLink>
        </div>

        <nav className="sidebar__nav">
          {sections.map((sec) => (
            <div key={sec} style={{ display: 'contents' }}>
              <div className="sidebar__section-title">{sec}</div>
              {ROUTES.filter((r) => r.section === sec).map((r) => (
                <NavLink key={r.path} to={r.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                  <span className="nav-item__icon">{r.icon}</span>
                  <span className="nav-item__text">{r.label}</span>
                  {r.badge && <span className="nav-item__badge">{r.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="user-profile-mini">
            <div className="user-profile-mini__avatar">{user.correo.slice(0, 2).toUpperCase()}</div>
            <div className="user-profile-mini__info">
              <div className="user-profile-mini__name">{user.correo}</div>
              <div className="user-profile-mini__role">Administrador</div>
            </div>
          </div>
          <button type="button" className="sidebar__logout" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar__left">
            <button type="button" className="btn-sidebar-toggle" title="Colapsar Menú Lateral" onClick={toggleSidebar}>☰</button>
            <div className="topbar__page-title">
              <h1>{current.title}</h1>
              <p>Policlínico SENATI · Sede Lima Norte</p>
            </div>
          </div>
          <div className="topbar__right">
            <div className="topbar__status-chip">
              <span className="status-dot-pulse" />
              Sistema Operativo
            </div>
            <button type="button" className="topbar__btn-action" title="Notificaciones" onClick={() => toast.info('Sin alertas críticas pendientes de triaje.')}>
              🔔
              <span className="topbar__notification-badge" />
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div>© 2026 Sistema Integral de Gestión Médica y Asistencial · <strong>SENATI</strong></div>
          <div>Frontend React + Vite · API Express / MySQL</div>
        </footer>
      </div>
    </div>
  )
}
