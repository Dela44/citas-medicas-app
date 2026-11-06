import { useMemo, useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import { ICONOS_MEDICOS } from '../data/mockDb'

function EspecialidadModal({ onClose }) {
  const { insert } = useStore()
  const toast = useToast()
  const [f, setF] = useState({ nombre: '', codigo: '', tarifa: '80.00', icono: '🩺' })
  const [busqueda, setBusqueda] = useState('')
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const iconos = useMemo(() => {
    const q = busqueda.toLowerCase().trim()
    return ICONOS_MEDICOS.filter((it) => it.tag.includes(q) || it.icon.includes(q))
  }, [busqueda])

  const submit = (e) => {
    e.preventDefault()
    const nombre = f.nombre.trim()
    insert('especialidades', {
      nombre,
      codigo: f.codigo.trim() || `MED-${nombre.substring(0, 3).toUpperCase()}`,
      tarifa: Number(f.tarifa) || 70.0,
      icono: f.icono || '🩺',
      estado: 'Activo',
    })
    toast.success(`Especialidad ${nombre} incorporada con éxito.`)
    onClose()
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
          <input className="form-control" required value={f.nombre} onChange={set('nombre')} placeholder="Ej. Neumología" />
        </div>
        <div className="form-group">
          <label className="form-label">Código</label>
          <input className="form-control" value={f.codigo} onChange={set('codigo')} placeholder="Ej. MED-NEU" />
        </div>
        <div className="form-group">
          <label className="form-label">Tarifa Base (S/)</label>
          <input type="number" min="0" className="form-control" step="1.00" value={f.tarifa} onChange={set('tarifa')} />
        </div>
        <div className="form-group">
          <label className="form-label">Icono Seleccionado</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', background: 'var(--slate-100)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>{f.icono}</span>
            <small style={{ color: 'var(--slate-500)' }}>Elige del repertorio abajo</small>
          </div>
        </div>
        <div className="form-group col-full" style={{ marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>🎨 Repertorio de Iconos Médicos:</label>
            <input
              className="form-control"
              style={{ width: 220, padding: '0.35rem 0.6rem', fontSize: 'var(--font-size-xs)' }}
              placeholder="🔍 Buscar icono: corazon, ojo, etc..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="icon-picker-grid">
            {iconos.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.8rem', padding: '1rem' }}>
                No se encontraron iconos para &quot;{busqueda}&quot;
              </div>
            ) : (
              iconos.map((it) => (
                <button key={it.icon} type="button" title={it.tag} className={`icon-picker-item ${it.icon === f.icono ? 'selected' : ''}`} onClick={() => setF((s) => ({ ...s, icono: it.icon }))}>
                  {it.icon}
                </button>
              ))
            )}
          </div>
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
    cmp: '', nombres: '', apellidos: '', especialidad: especialidades[0]?.nombre || 'Medicina General',
    email: '', telefono: '', consultorio: '101 (Piso 1)', horario: 'Lun-Vie 08:00 - 14:00',
    ...(medico || {}),
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const nombres = f.nombres.trim()
    const apellidos = f.apellidos.trim()
    const registro = {
      cmp: f.cmp.trim(),
      nombres,
      apellidos,
      especialidad: f.especialidad,
      telefono: f.telefono.trim(),
      email: f.email.trim() || `${nombres.toLowerCase().replace(/[^a-z]/g, '')}@clinicasenati.pe`,
      consultorio: f.consultorio.trim(),
      horario: f.horario.trim(),
      sedeId: 1,
      foto: nombres.includes('Dra') ? '👩‍⚕️' : '👨‍⚕️',
    }
    if (medico) {
      update('medicos', medico.id, registro)
      toast.success(`Médico ${nombres} ${apellidos} actualizado.`)
    } else {
      insert('medicos', { ...registro, estado: 'Disponible' })
      toast.success(`Médico ${nombres} ${apellidos} registrado satisfactoriamente.`)
    }
    onClose()
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
          <label className="form-label">Colegiatura CMP <span className="required">*</span></label>
          <input className="form-control" required value={f.cmp} onChange={set('cmp')} placeholder="Ej. 58421" />
        </div>
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
          <select className="form-control" required value={f.especialidad} onChange={set('especialidad')}>
            {especialidades.map((e) => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Teléfono Móvil <span className="required">*</span></label>
          <input type="tel" className="form-control" maxLength={9} required value={f.telefono} onChange={set('telefono')} placeholder="987654321" />
        </div>
        <div className="form-group">
          <label className="form-label">Correo Corporativo</label>
          <input type="email" className="form-control" value={f.email} onChange={set('email')} placeholder="medico@clinicasenati.pe" />
        </div>
        <div className="form-group">
          <label className="form-label">Consultorio Asignado</label>
          <input className="form-control" value={f.consultorio} onChange={set('consultorio')} placeholder="Ej. 102 (Piso 1)" />
        </div>
        <div className="form-group">
          <label className="form-label">Horario de Guardia</label>
          <input className="form-control" value={f.horario} onChange={set('horario')} placeholder="Ej. Lun-Vie 08:00 - 14:00" />
        </div>
      </form>
    </Modal>
  )
}

export default function Medicos() {
  const { data, remove } = useStore()
  const toast = useToast()
  const [modalEsp, setModalEsp] = useState(false)
  const [modalMed, setModalMed] = useState(null) // null | 'nuevo' | medico
  const { medicos, especialidades } = data

  const eliminarEsp = (e) => {
    if (!window.confirm(`¿Estás seguro de eliminar la especialidad "${e.nombre}"? Esta acción removerá la tarjeta del catálogo.`)) return
    remove('especialidades', e.id)
    toast.warning(`Especialidad "${e.nombre}" eliminada del catálogo.`)
  }

  const eliminarMed = (m) => {
    if (!window.confirm(`¿Dar de baja al médico ${m.nombres} ${m.apellidos}?`)) return
    remove('medicos', m.id)
    toast.warning('Médico retirado del sistema.')
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="card__header">
          <div>
            <h3 className="card__title">🩺 Especialidades Médicas</h3>
            <p className="card__subtitle">Catálogo de servicios asistenciales y tarifas asignadas</p>
          </div>
          <button type="button" className="btn btn--outline btn--sm" onClick={() => setModalEsp(true)}>+ Nueva Especialidad</button>
        </div>
        <div className="specialty-grid">
          {especialidades.map((esp) => (
            <div key={esp.id} className="specialty-card-modern">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
                <span style={{ fontSize: '2.2rem', flexShrink: 0 }}>{esp.icono || '🩺'}</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{esp.nombre}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary-600)', fontWeight: 700 }}>Tarifa: S/ {Number(esp.tarifa).toFixed(2)}</div>
                  <small style={{ color: 'var(--slate-500)', fontSize: '0.72rem' }}>Cód: {esp.codigo}</small>
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
            <h3 className="card__title">👨‍⚕️ Plantel Médico y Horarios de Atención</h3>
            <p className="card__subtitle">Gestión de profesionales de la salud, CMP y consultorios</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => setModalMed('nuevo')}>+ Registrar Médico</button>
        </div>
        <div className="table-container">
          <table className="table-modern">
            <thead>
              <tr><th>Médico</th><th>N° CMP</th><th>Especialidad</th><th>Consultorio Asignado</th><th>Horario de Guardia</th><th>Contacto</th><th>Estado</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {medicos.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">No hay médicos registrados.</td></tr>
              ) : (
                medicos.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>{m.foto || '👨‍⚕️'}</span>
                        <div>
                          <strong style={{ color: 'var(--slate-900)' }}>{m.nombres} {m.apellidos}</strong>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--slate-500)' }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{m.cmp}</strong></td>
                    <td><span className="badge badge--primary">{m.especialidad}</span></td>
                    <td><span className="badge badge--neutral">{m.consultorio}</span></td>
                    <td><small style={{ fontWeight: 600 }}>{m.horario}</small></td>
                    <td>📞 {m.telefono}</td>
                    <td><span className={`badge ${m.estado === 'Disponible' ? 'badge--success' : 'badge--warning'}`}>{m.estado}</span></td>
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

      {modalEsp && <EspecialidadModal onClose={() => setModalEsp(false)} />}
      {modalMed && <MedicoModal medico={modalMed === 'nuevo' ? null : modalMed} onClose={() => setModalMed(null)} />}
    </div>
  )
}
