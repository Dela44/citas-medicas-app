import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ mode }) {
  const registering = mode === 'register'
  const { user, sessionError, login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    correo: '',
    password: '',
  })
  const [error, setError] = useState(sessionError)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={user.rol === 'ADMIN' ? '/dashboard' : '/portal'} replace />

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const sessionUser = registering
        ? await register(form)
        : await login({ correo: form.correo, password: form.password })
      navigate(sessionUser.rol === 'ADMIN' ? '/dashboard' : '/portal', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__icon">✚</span>
          <div>
            <strong>TUSALUD</strong>
            <span>Centro Médico · Citas en línea</span>
          </div>
        </div>
        <h1>{registering ? 'Crea tu cuenta de paciente' : 'Bienvenido'}</h1>
        <p className="auth-card__description">
          {registering ? 'Regístrate para solicitar y consultar tus citas médicas.' : 'Inicia sesión para continuar al sistema.'}
        </p>

        <form className="auth-form" onSubmit={submit}>
          {registering && (
            <>
              <label>
                Nombres
                <input name="nombres" autoComplete="given-name" required value={form.nombres} onChange={update} />
              </label>
              <label>
                Apellidos
                <input name="apellidos" autoComplete="family-name" required value={form.apellidos} onChange={update} />
              </label>
              <label>
                DNI
                <input name="dni" inputMode="numeric" pattern="[0-9]{8}" maxLength={8} required value={form.dni} onChange={update} />
              </label>
              <label>
                Fecha de nacimiento
                <input name="fechaNacimiento" type="date" value={form.fechaNacimiento} onChange={update} />
              </label>
              <label>
                Teléfono
                <input name="telefono" type="tel" autoComplete="tel" value={form.telefono} onChange={update} />
              </label>
            </>
          )}
          <label>
            Correo electrónico
            <input name="correo" type="email" autoComplete="email" required value={form.correo} onChange={update} />
          </label>
          <label>
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete={registering ? 'new-password' : 'current-password'}
              minLength={8}
              required
              value={form.password}
              onChange={update}
            />
            {registering && <small>Usa al menos 8 caracteres.</small>}
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="btn btn--primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Procesando...' : registering ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-card__switch">
          {registering ? '¿Ya tienes una cuenta?' : '¿Eres paciente y aún no tienes cuenta?'}{' '}
          <Link to={registering ? '/login' : '/registro'}>{registering ? 'Inicia sesión' : 'Regístrate'}</Link>
        </p>
        <p className="auth-card__admin-note">El acceso de administración lo habilita el administrador del sistema.</p>
      </section>
    </main>
  )
}
