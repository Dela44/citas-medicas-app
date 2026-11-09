import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../services/storeService'
import { useAuth } from '../context/AuthContext'

export default function PatientPortal() {
  const { user, logout } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    const [availableDoctors, ownAppointments] = await Promise.all([
      apiRequest('portal/doctors'),
      apiRequest('portal/appointments'),
    ])
    setDoctors(availableDoctors)
    setAppointments(ownAppointments)
  }, [])

  useEffect(() => {
    reload().catch((requestError) => setError(requestError.message))
  }, [reload])

  const reserve = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await apiRequest('portal/appointments', {
        method: 'POST',
        body: JSON.stringify({ medicoId: Number(doctorId), fecha, hora }),
      })
      setNotice('Tu cita fue reservada correctamente.')
      setFecha('')
      setHora('')
      await reload()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (appointmentId) => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await apiRequest(`portal/appointments/${appointmentId}/cancel`, { method: 'PATCH' })
      setNotice('La cita fue cancelada.')
      await reload()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="patient-portal">
      <header className="patient-portal__header">
        <div>
          <span className="patient-portal__eyebrow">PORTAL DEL PACIENTE</span>
          <h1>Hola, {user.correo}</h1>
          <p>Solicita una cita y revisa solo tus propias reservas.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={logout}>Cerrar sesión</button>
      </header>

      {error && <p className="portal-message portal-message--error" role="alert">{error}</p>}
      {notice && <p className="portal-message portal-message--success" role="status">{notice}</p>}

      <section className="portal-card">
        <h2>Reservar una cita</h2>
        {doctors.length === 0 ? (
          <p className="portal-empty">Todavía no hay médicos registrados para reservar.</p>
        ) : (
          <form className="portal-booking-form" onSubmit={reserve}>
            <label>
              Médico
              <select required value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
                <option value="">Selecciona un médico</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.nombres} {doctor.apellidos} · {doctor.especialidad}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha
              <input type="date" required min={new Date().toLocaleDateString('en-CA')} value={fecha} onChange={(event) => setFecha(event.target.value)} />
            </label>
            <label>
              Hora
              <input type="time" required value={hora} onChange={(event) => setHora(event.target.value)} />
            </label>
            <button type="submit" className="btn btn--primary" disabled={busy}>Solicitar cita</button>
          </form>
        )}
      </section>

      <section className="portal-card">
        <h2>Mis citas</h2>
        {appointments.length === 0 ? (
          <p className="portal-empty">Aún no tienes citas reservadas.</p>
        ) : (
          <div className="portal-appointments">
            {appointments.map((appointment) => (
              <article className="portal-appointment" key={appointment.id}>
                <div>
                  <strong>{appointment.medicoNombre}</strong>
                  <span>{appointment.especialidad}</span>
                  <small>{appointment.fecha} · {appointment.hora} · {appointment.codigoCita}</small>
                </div>
                <div className="portal-appointment__actions">
                  <span className={`badge ${appointment.estado === 'Cancelado' ? 'badge--neutral' : 'badge--success'}`}>
                    {appointment.estado}
                  </span>
                  {appointment.estado === 'Programada' && (
                    <button type="button" className="btn btn--outline btn--sm" disabled={busy} onClick={() => cancel(appointment.id)}>
                      Cancelar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
