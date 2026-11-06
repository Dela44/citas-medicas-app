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
  const { pacientes, medicos, sedes, especialidades, citas } = data
  const [f, setF] = useState({
    pacienteId: '', medicoId: '', sede: sedes[0]?.nombre || '', fecha: hoyISO(), hora: '10:00',
    monto: '60.00', estadoPago: 'Pagado', motivo: '',
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const alElegirMedico = (e) => {
    const medicoId = e.target.value
    const m = medicos.find((x) => String(x.id) === medicoId)
    const esp = m && especialidades.find((x) => x.nombre === m.especialidad)
    setF((s) => ({ ...s, medicoId, monto: esp ? Number(esp.tarifa).toFixed(2) : s.monto }))
  }

  const submit = (e) => {
    e.preventDefault()
    const paciente = pacientes.find((p) => String(p.id) === f.pacienteId)
    const medico = medicos.find((m) => String(m.id) === f.medicoId)
    if (!paciente || !medico) return
    const siguiente = citas.reduce((max, c) => Math.max(max, c.id), 0) + 1
    const codigoCita = `CIT-${f.fecha.slice(0, 4)}-${String(siguiente).padStart(3, '0')}`
    insert('citas', {
      codigoCita,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteDni: paciente.dni,
      medicoId: medico.id,
      medicoNombre: `${medico.nombres} ${medico.apellidos}`,
      especialidad: medico.especialidad,
      sede: f.sede,
      consultorio: (medico.consultorio || '').split(' ')[0],
      fecha: f.fecha,
      hora: f.hora,
      motivo: f.motivo.trim() || 'Consulta médica ordinaria',
      monto: Number(f.monto) || 0,
      estadoPago: f.estadoPago,
      estado: 'Programada',
    })
    toast.success(`Cita médica ${codigoCita} agendada para ${paciente.nombres} ${paciente.apellidos}.`)
    onClose()
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
          <select className="form-control" required value={f.medicoId} onChange={alElegirMedico}>
            <option value="">-- Seleccionar Médico --</option>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombres} {m.apellidos} - {m.especialidad}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sede de Atención <span className="required">*</span></label>
          <select className="form-control" required value={f.sede} onChange={set('sede')}>
            {sedes.map((s) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
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
        <div className="form-group">
          <label className="form-label">Costo Consulta (S/)</label>
          <input type="number" min="0" className="form-control" value={f.monto} step="0.50" onChange={set('monto')} />
        </div>
        <div className="form-group">
          <label className="form-label">Estado del Pago</label>
          <select className="form-control" value={f.estadoPago} onChange={set('estadoPago')}>
            <option value="Pagado">Pagado (Caja / Yape)</option>
            <option value="Pendiente">Pendiente de Pago</option>
          </select>
        </div>
        <div className="form-group col-full">
          <label className="form-label">Motivo de Consulta / Síntomas</label>
          <textarea className="form-control" rows={2} value={f.motivo} onChange={set('motivo')} placeholder="Describa el motivo o síntoma principal del paciente..." />
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
    setNueva(true)
  }

  const eliminar = (c) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de la cita ${c.codigoCita}?`)) return
    remove('citas', c.id)
    toast.warning(`Cita ${c.codigoCita} eliminada.`)
  }

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">📅 Gestión y Agendamiento de Citas</h3>
          <p className="card__subtitle">Control de turnos, consultorios asignados y estados de atención</p>
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
            <tr><th>Código Cita</th><th>Fecha / Hora</th><th>Paciente</th><th>Médico &amp; Especialidad</th><th>Sede &amp; Consultorio</th><th>Costo / Pago</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={8} className="empty-row">No hay citas registradas bajo este criterio.</td></tr>
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
                  <td>
                    <div>{c.sede}</div>
                    <small className="cell-sub">Cons: <strong>{c.consultorio}</strong></small>
                  </td>
                  <td>
                    <div>S/ {Number(c.monto).toFixed(2)}</div>
                    <span className={`badge ${c.estadoPago === 'Pagado' ? 'badge--success' : 'badge--warning'}`}>{c.estadoPago}</span>
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
