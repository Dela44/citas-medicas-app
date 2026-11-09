import { Link, Navigate } from 'react-router-dom'
import logo from '../assets/logo-tusalud-icon.png'
import { useAuth } from '../context/AuthContext'

const specialties = [
  { icon: '🩺', name: 'Medicina general', description: 'Atención integral para cuidar tu salud día a día.' },
  { icon: '❤️', name: 'Cardiología', description: 'Evaluación y cuidado especializado del corazón.' },
  { icon: '👶', name: 'Pediatría', description: 'Acompañamiento médico para los más pequeños.' },
  { icon: '🌸', name: 'Ginecología', description: 'Atención cercana para la salud de la mujer.' },
  { icon: '👁️', name: 'Oftalmología', description: 'Cuidado preventivo y evaluación de tu visión.' },
  { icon: '🦷', name: 'Odontología', description: 'Prevención y cuidado de tu salud bucal.' },
]

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) return <div className="api-state">Verificando sesión...</div>
  if (user) return <Navigate to={user.rol === 'ADMIN' ? '/dashboard' : '/portal'} replace />

  return (
    <div className="public-site">
      <header className="public-header">
        <a className="public-brand" href="#inicio" aria-label="TuSalud, inicio">
          <img src={logo} alt="" />
          <span>TUSALUD<small>Centro Médico</small></span>
        </a>
        <nav className="public-nav" aria-label="Navegación principal">
          <a href="#especialidades">Especialidades</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
        </nav>
        <div className="public-header__actions">
          <Link className="public-login-link" to="/login">Iniciar sesión</Link>
          <Link className="public-button public-button--small" to="/registro">Reserva tu cita <span aria-hidden="true">↗</span></Link>
        </div>
      </header>

      <main>
        <section className="public-hero" id="inicio">
          <div className="public-hero__content">
            <span className="public-eyebrow"><span /> CUIDAMOS DE TI Y DE LOS TUYOS</span>
            <h1>Tu bienestar merece una atención <em>cercana.</em></h1>
            <p>Encuentra la especialidad que necesitas y solicita tu cita en pocos pasos. Estamos aquí para acompañarte.</p>
            <div className="public-hero__actions">
              <Link className="public-button" to="/registro">Agenda tu cita <span aria-hidden="true">↗</span></Link>
              <a className="public-text-link" href="#especialidades">Conoce nuestras especialidades <span aria-hidden="true">↓</span></a>
            </div>
            <div className="public-hero__note">
              <span className="public-hero__note-icon" aria-hidden="true">✓</span>
              <span><strong>Un espacio para cuidarte</strong><small>Atención pensada para cada etapa de tu vida</small></span>
            </div>
          </div>

          <div className="public-hero__visual" aria-label="Información de atención médica">
            <div className="public-visual-orbit public-visual-orbit--one" />
            <div className="public-visual-orbit public-visual-orbit--two" />
            <div className="public-visual-cross" aria-hidden="true">+</div>
            <article className="public-welcome-card">
              <div className="public-welcome-card__top">
                <span className="public-welcome-card__symbol" aria-hidden="true">✚</span>
                <span className="public-welcome-card__status"><i /> Estamos para ayudarte</span>
              </div>
              <div className="public-welcome-card__illustration" aria-hidden="true">
                <span className="public-illustration-circle" />
                <span className="public-illustration-person">✦</span>
                <span className="public-illustration-heart">♡</span>
                <span className="public-illustration-spark">✳</span>
              </div>
              <span className="public-welcome-card__caption">Tu salud, nuestra prioridad</span>
              <h2>Un cuidado que<br />se siente cerca.</h2>
              <p>Profesionales listos para acompañar tu bienestar.</p>
              <Link to="/registro" className="public-welcome-card__link">Conoce el portal de pacientes <span aria-hidden="true">→</span></Link>
            </article>
            <div className="public-hero__floating public-hero__floating--top"><span>♡</span> Cuidado integral</div>
            <div className="public-hero__floating public-hero__floating--bottom"><span>✚</span> Atención con calidez</div>
          </div>
        </section>

        <section className="public-trust" id="nosotros">
          <div><span className="public-trust__icon">✦</span><p><strong>Atención cercana</strong><small>Un trato humano en cada visita</small></p></div>
          <div><span className="public-trust__icon">♡</span><p><strong>Para toda la familia</strong><small>Opciones para distintas necesidades</small></p></div>
          <div><span className="public-trust__icon">✓</span><p><strong>Reserva sencilla</strong><small>Solicita tu cita desde el portal</small></p></div>
        </section>

        <section className="public-specialties" id="especialidades">
          <div className="public-section-heading">
            <div>
              <span className="public-eyebrow">SERVICIOS PARA TU BIENESTAR</span>
              <h2>Encuentra la atención que buscas</h2>
              <p>Explora algunas de nuestras especialidades y solicita una cita con nuestro equipo.</p>
            </div>
            <Link to="/registro" className="public-text-link">Ver disponibilidad <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="public-specialty-grid">
            {specialties.map((specialty) => (
              <article className="public-specialty-card" key={specialty.name}>
                <span className="public-specialty-card__icon" aria-hidden="true">{specialty.icon}</span>
                <h3>{specialty.name}</h3>
                <p>{specialty.description}</p>
                <Link to="/registro" aria-label={`Solicitar cita de ${specialty.name}`}>Solicitar una cita <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </section>

        <section className="public-cta" id="contacto">
          <div>
            <span className="public-eyebrow">ESTAMOS PARA ACOMPAÑARTE</span>
            <h2>Da el siguiente paso para cuidar de ti.</h2>
            <p>Crea tu cuenta para solicitar y revisar tus citas desde un solo lugar.</p>
          </div>
          <Link className="public-button public-button--light" to="/registro">Comenzar ahora <span aria-hidden="true">↗</span></Link>
        </section>
      </main>

      <footer className="public-footer">
        <a className="public-brand" href="#inicio" aria-label="Volver al inicio">
          <img src={logo} alt="" />
          <span>TUSALUD<small>Centro Médico</small></span>
        </a>
        <p>© 2026 TuSalud · Centro Médico. Cuidamos de ti y de los tuyos.</p>
        <Link to="/login">Acceso al sistema</Link>
      </footer>
    </div>
  )
}
