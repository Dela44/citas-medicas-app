import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'

function EspecialidadModal({ onClose }) {
  const { insert } = useStore()
  const toast = useToast()
  const [nombre, setNombre] = useState('')
  const submit = async (e) => {
    e.preventDefault()
    const limpio = nombre.trim()
    try {
      await insert('especialidades', { nombre: limpio })
      toast.success(`Especialidad ${limpio} incorporada con éxito.`)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      open
      title="🩺 Registrar Nueva Especialidad Médica"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
          <button type="submit" form="formEsp" className="btn btn--primary">Guardar Especialidad</button>
        </>
      }
    >
      <form id="formEsp" className="form-grid" onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Nombre de Especialidad <span className="required">*</span></label>
          <input className="form-control" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Neumología" />
        </div>
      </form>
    </Modal>
  )
}

function MedicoModal({ medico, onClose }) {
  const { data, insert, update } = useStore()
  const toast = useToast()
  const { especialidades } = data
  const [f, setF] = useState({
    especialidadId: String(especialidades[0]?.id || ''), nombres: '', apellidos: '',
    ...(medico || {}),
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const nombres = f.nombres.trim()
    const apellidos = f.apellidos.trim()
    const registro = { nombres, apellidos, especialidadId: Number(f.especialidadId) }
    try {
      if (medico) {
        await update('medicos', medico.id, registro)
        toast.success(`Médico ${nombres} ${apellidos} actualizado.`)
      } else {
        await insert('medicos', registro)
        toast.success(`Médico ${nombres} ${apellidos} registrado satisfactoriamente.`)
      }
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      open
      title={medico ? `✏️ Editar Médico: ${medico.nombres}` : '👨‍⚕️ Registrar Profesional Médico'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
          <button type="submit" form="formMedico" className="btn btn--primary">{medico ? 'Actualizar Médico' : 'Guardar Médico'}</button>
        </>
      }
    >
      <form id="formMedico" className="form-grid" onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Nombres <span className="required">*</span></label>
          <input className="form-control" required value={f.nombres} onChange={set('nombres')} placeholder="Ej. Dr. Carlos" />
        </div>
        <div className="form-group">
          <label className="form-label">Apellidos <span className="required">*</span></label>
          <input className="form-control" required value={f.apellidos} onChange={set('apellidos')} placeholder="Ej. Mendoza Paredes" />
        </div>
        <div className="form-group">
          <label className="form-label">Especialidad Médica <span className="required">*</span></label>
          <select className="form-control" required value={f.especialidadId} onChange={set('especialidadId')}>
            <option value="">Seleccione especialidad</option>
            {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
      </form>
    </Modal>
  )
}

const PERSONAL = {
  recepcionistas: { label: 'Recepcionista', fields: ['correo', 'telefono'] },
  enfermeros: { label: 'Enfermero', fields: ['telefono'] },
  cajeros: { label: 'Cajero', fields: [] },
}

function PersonalModal({ tipo, onClose }) {
  const { insert } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '', telefono: '' })
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const { label, fields } = PERSONAL[tipo]

  const submit = async (event) => {
    event.preventDefault()
    const record = Object.fromEntries(['nombres', 'apellidos', ...fields].map((key) => [key, form[key].trim()]))
    try {
      await insert(tipo, record)
      toast.success(`${label} registrado correctamente.`)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal open title={`Registrar ${label}`} onClose={onClose} footer={
      <>
        <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
        <button type="submit" form="formPersonal" className="btn btn--primary">Guardar</button>
      </>
    }>
      <form id="formPersonal" className="form-grid" onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Nombres <span className="required">*</span></label>
          <input className="form-control" required value={form.nombres} onChange={set('nombres')} />
        </div>
        <div className="form-group">
          <label className="form-label">Apellidos <span className="required">*</span></label>
          <input className="form-control" required value={form.apellidos} onChange={set('apellidos')} />
        </div>
        {fields.includes('correo') && <div className="form-group">
          <label className="form-label">Correo</label>
          <input type="email" className="form-control" value={form.correo} onChange={set('correo')} />
        </div>}
        {fields.includes('telefono') && <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input type="tel" maxLength={20} className="form-control" value={form.telefono} onChange={set('telefono')} />
        </div>}
      </form>
    </Modal>
  )
}

export default function Medicos() {
  const { data, remove } = useStore()
  const toast = useToast()
  const [modalEsp, setModalEsp] = useState(false)
  const [modalMed, setModalMed] = useState(null) // null | 'nuevo' | medico
  const [personalTipo, setPersonalTipo] = useState(null)
  const { medicos, especialidades } = data

  const eliminarEsp = async (e) => {
    if (!window.confirm(`¿Estás seguro de eliminar la especialidad "${e.nombre}"? Esta acción removerá la tarjeta del catálogo.`)) return
    try {
      await remove('especialidades', e.id)
      toast.warning(`Especialidad "${e.nombre}" eliminada del catálogo.`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const eliminarMed = async (m) => {
    if (!window.confirm(`¿Dar de baja al médico ${m.nombres} ${m.apellidos}?`)) return
    try {
      await remove('medicos', m.id)
      toast.warning('Médico retirado del sistema.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">🩺 Especialidades Médicas</h3>
            <p className="card__subtitle">Catálogo de especialidades disponibles para asignar a médicos</p>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => setModalEsp(true)}>+ Nueva Especialidad</button>
        </div>
        <div className="specialty-grid">
          {especialidades.map((esp) => (
            <div key={esp.id} className="specialty-card-modern">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                <span style={{ fontSize: '2.2rem', flexShrink: 0 }}>🩺</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{esp.nombre}</div>
                </div>
              </div>
              <button type="button" className="specialty-card-modern__btn-delete" title="Eliminar Especialidad" onClick={() => eliminarEsp(esp)}>🗑️</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">👨‍⚕️ Plantel Médico</h3>
            <p className="card__subtitle">Profesionales vinculados a su especialidad clínica</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setModalMed('nuevo')}>+ Registrar Médico</button>
        </div>
        <div className="table-container">
          <table className="table-modern">
            <thead>
              <tr><th>Médico</th><th>Especialidad</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {medicos.length === 0 ? (
                <tr><td colSpan={3} className="empty-row">No hay médicos registrados.</td></tr>
              ) : (
                medicos.map((m) => (
                  <tr key={m.id}>
                    <td><strong style={{ color: 'var(--slate-900)' }}>{m.nombres} {m.apellidos}</strong></td>
                    <td><span className="badge badge--primary">{m.especialidad}</span></td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="btn btn--outline btn--sm btn--icon-only" title="Editar" onClick={() => setModalMed(m)}>✏️</button>
                        <button type="button" className="btn btn--danger btn--sm btn--icon-only" title="Desactivar" onClick={() => eliminarMed(m)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">Personal de atención</h3>
            <p className="card__subtitle">Asignación de responsables para citas, triaje y pagos</p>
          </div>
        </div>
        <div className="specialty-grid">
          {Object.entries(PERSONAL).map(([tipo, { label }]) => (
            <div key={tipo} className="specialty-card-modern">
              <div style={{ overflow: 'hidden' }}>
                <strong>{label}s ({data[tipo].length})</strong>
                <div className="cell-sub" title={data[tipo].map((persona) => `${persona.nombres} ${persona.apellidos}`).join(', ')}>
                  {data[tipo].map((persona) => `${persona.nombres} ${persona.apellidos}`).join(', ') || 'Sin registros'}
                </div>
              </div>
              <button type="button" className="btn btn--outline btn--sm" onClick={() => setPersonalTipo(tipo)} title={`Registrar ${label}`}>
                + Añadir
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalEsp && <EspecialidadModal onClose={() => setModalEsp(false)} />}
      {modalMed && <MedicoModal medico={modalMed === 'nuevo' ? null : modalMed} onClose={() => setModalMed(null)} />}
      {personalTipo && <PersonalModal tipo={personalTipo} onClose={() => setPersonalTipo(null)} />}
    </div>
  )
}
