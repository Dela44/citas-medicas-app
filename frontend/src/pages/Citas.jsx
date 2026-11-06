import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import CitaEstadoModal from '../components/ui/CitaEstadoModal'
import { hoyISO } from '../utils/dates'

const estadoBadge = (e) => (e === 'En Espera' ? 'badge--warning' : e === 'En Consulta' ? 'badge--primary' : e === 'Atendido' ? 'badge--success' : 'badge--neutral')

function NuevaCitaModal({ onClose }) {
  const { data, insert } = useStore()
  const toast = useToast()
  const { pacientes, medicos, recepcionistas } = data
  const [f, setF] = useState({
    pacienteId: '', medicoId: '', recepcionistaId: '', fecha: hoyISO(), hora: '10:00',
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const paciente = pacientes.find((p) => String(p.id) === f.pacienteId)
    try {
      const cita = await insert('citas', {
        pacienteId: Number(f.pacienteId),
        medicoId: Number(f.medicoId),
        recepcionistaId: Number(f.recepcionistaId),
        fecha: f.fecha,
        hora: f.hora,
        estado: 'Programada',
      })
      toast.success(`Cita médica ${cita.codigoCita} agendada para ${paciente.nombres} ${paciente.apellidos}.`)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      open
      title="📅 Agendar Nueva Cita Médica"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
          <button type="submit" form="formCita" className="btn btn--primary">Confirmar y Agendar Cita</button>
        </>
      }
    >
      <form id="formCita" className="form-grid" onSubmit={submit}>
        <div className="form-group col-full">
          <label className="form-label">Seleccionar Paciente <span className="required">*</span></label>
          <select className="form-control" required value={f.pacienteId} onChange={set('pacienteId')}>
            <option value="">-- Seleccionar Paciente --</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} (DNI: {p.dni})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Médico Tratante <span className="required">*</span></label>
          <select className="form-control" required value={f.medicoId} onChange={set('medicoId')}>
            <option value="">-- Seleccionar Médico --</option>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombres} {m.apellidos} - {m.especialidad}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Recepcionista <span className="required">*</span></label>
          <select className="form-control" required value={f.recepcionistaId} onChange={set('recepcionistaId')}>
            <option value="">-- Seleccionar Recepcionista --</option>
            {recepcionistas.map((r) => <option key={r.id} value={r.id}>{r.nombres} {r.apellidos}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de la Cita <span className="required">*</span></label>
          <input type="date" className="form-control" required value={f.fecha} onChange={set('fecha')} />
        </div>
        <div className="form-group">
          <label className="form-label">Hora <span className="required">*</span></label>
          <input type="time" className="form-control" required value={f.hora} onChange={set('hora')} />
        </div>
      </form>
    </Modal>
  )
}

export default function Citas() {
  const { data, remove } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [estado, setEstado] = useState('TODOS')
  const [nueva, setNueva] = useState(false)
  const [gestionar, setGestionar] = useState(null)

  const lista = useMemo(() => {
    const t = q.toLowerCase().trim()
    return data.citas.filter(
      (c) =>
        (estado === 'TODOS' || c.estado === estado) &&
        (!t ||
          c.pacienteNombre.toLowerCase().includes(t) ||
          c.pacienteDni.includes(t) ||
          c.medicoNombre.toLowerCase().includes(t) ||
          c.codigoCita.toLowerCase().includes(t)),
    )
  }, [data.citas, q, estado])

  const abrirNueva = () => {
    if (data.pacientes.length === 0) {
      window.alert("No hay pacientes registrados en el sistema. Registre primero un paciente en la sección 'Pacientes'.")
      navigate('/pacientes')
      return
    }
    if (data.medicos.length === 0) {
      window.alert("No hay médicos registrados en el sistema. Registre primero un médico en la sección 'Médicos & Especialidades'.")
      navigate('/medicos')
      return
    }
    if (data.recepcionistas.length === 0) {
      window.alert('No hay recepcionistas registrados en la base de datos para asignar la cita.')
      return
    }
    setNueva(true)
  }

  const eliminar = async (c) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de la cita ${c.codigoCita}?`)) return
    try {
      await remove('citas', c.id)
      toast.warning(`Cita ${c.codigoCita} eliminada.`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">📅 Gestión y Agendamiento de Citas</h3>
          <p className="card__subtitle">Agenda y seguimiento de citas por paciente y profesional</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={abrirNueva}>+ Agendar Nueva Cita</button>
      </div>

      <div className="action-bar">
        <div className="search-box">
          <span className="search-box__icon">🔍</span>
          <input className="form-control" placeholder="Buscar cita por paciente, DNI o médico..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="TODOS">Todos los Estados</option>
          <option value="En Espera">En Espera</option>
          <option value="En Consulta">En Consulta</option>
          <option value="Programada">Programada</option>
          <option value="Atendido">Atendidos</option>
          <option value="Cancelado">Cancelados</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table-modern">
          <thead>
            <tr><th>Código Cita</th><th>Fecha / Hora</th><th>Paciente</th><th>Médico &amp; Especialidad</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={6} className="empty-row">No hay citas registradas bajo este criterio.</td></tr>
            ) : (
              lista.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.codigoCita}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>📅 {c.fecha}</div>
                    <small style={{ color: 'var(--primary-700)', fontWeight: 700 }}>⏰ {c.hora}</small>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.pacienteNombre}</div>
                    <small className="cell-sub">DNI: {c.pacienteDni}</small>
                  </td>
                  <td>
                    <div>{c.medicoNombre}</div>
                    <small className="badge badge--neutral" style={{ marginTop: 2 }}>{c.especialidad}</small>
                  </td>
                  <td><span className={`badge ${estadoBadge(c.estado)}`}>{c.estado}</span></td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn--outline btn--sm btn--icon-only" title="Modificar Estado" onClick={() => setGestionar(c)}>⚙️</button>
                      <button type="button" className="btn btn--danger btn--sm btn--icon-only" title="Eliminar Registro de Cita" onClick={() => eliminar(c)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {nueva && <NuevaCitaModal onClose={() => setNueva(false)} />}
      {gestionar && <CitaEstadoModal cita={gestionar} onClose={() => setGestionar(null)} />}
    </div>
  )
}
