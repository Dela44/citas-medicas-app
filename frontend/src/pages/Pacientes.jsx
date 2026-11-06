import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'

const VACIO = {
  dni: '', nombres: '', apellidos: '', fechaNacimiento: '', genero: 'Masculino', telefono: '',
  email: '', direccion: '', grupoSanguineo: 'O+', alergias: 'Ninguna', contactoEmergencia: '',
}
const GRUPOS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

function calcularEdad(fecha) {
  if (!fecha) return null
  const n = new Date(fecha)
  if (Number.isNaN(n.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - n.getFullYear()
  const m = hoy.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--
  return Math.max(edad, 0)
}

function PacienteForm({ paciente, onClose }) {
  const { insert, update } = useStore()
  const toast = useToast()
  const [f, setF] = useState({ ...VACIO, ...(paciente || {}) })
  const [errors, setErrors] = useState({})
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const dni = f.dni.trim()
    const telefono = f.telefono.trim()
    const errs = {}
    if (!/^\d{8}$/.test(dni)) errs.dni = 'El DNI debe contener exactamente 8 dígitos numéricos.'
    if (!/^\d{9}$/.test(telefono)) errs.telefono = 'El teléfono celular debe contener exactamente 9 dígitos numéricos.'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const registro = {
      dni,
      nombres: f.nombres.trim(),
      apellidos: f.apellidos.trim(),
      fechaNacimiento: f.fechaNacimiento,
      edad: calcularEdad(f.fechaNacimiento),
      genero: f.genero,
      telefono,
      email: f.email.trim(),
      direccion: f.direccion.trim(),
      grupoSanguineo: f.grupoSanguineo,
      alergias: f.alergias.trim() || 'Ninguna',
      contactoEmergencia: f.contactoEmergencia.trim(),
      historiaClinica: `HC-${dni}`,
      estado: 'Activo',
    }

    if (paciente) {
      update('pacientes', paciente.id, registro)
      toast.success(`Paciente ${registro.nombres} ${registro.apellidos} actualizado correctamente.`)
    } else {
      insert('pacientes', { ...registro, fechaRegistro: new Date().toISOString().split('T')[0] })
      toast.success(`Paciente ${registro.nombres} registrado exitosamente con Historia HC-${dni}.`)
    }
    onClose()
  }

  return (
    <Modal
      open
      title={paciente ? `✏️ Editar Paciente: ${paciente.nombres}` : '📋 Registro de Nuevo Paciente'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
          <button type="submit" form="formPaciente" className="btn btn--primary">{paciente ? 'Actualizar Paciente' : 'Guardar Paciente'}</button>
        </>
      }
    >
      <form id="formPaciente" className="form-grid" onSubmit={submit} noValidate={false}>
        <div className="form-group">
          <label className="form-label">DNI (8 dígitos) <span className="required">*</span></label>
          <input className={`form-control ${errors.dni ? 'is-invalid' : ''}`} maxLength={8} required value={f.dni} onChange={set('dni')} placeholder="Ej. 72345678" inputMode="numeric" />
          {errors.dni && <div className="form-error">{errors.dni}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Nombres <span className="required">*</span></label>
          <input className="form-control" required value={f.nombres} onChange={set('nombres')} placeholder="Nombres completos" />
        </div>
        <div className="form-group">
          <label className="form-label">Apellidos <span className="required">*</span></label>
          <input className="form-control" required value={f.apellidos} onChange={set('apellidos')} placeholder="Apellidos paterno y materno" />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Nacimiento</label>
          <input type="date" className="form-control" value={f.fechaNacimiento} onChange={set('fechaNacimiento')} />
        </div>
        <div className="form-group">
          <label className="form-label">Género <span className="required">*</span></label>
          <select className="form-control" required value={f.genero} onChange={set('genero')}>
            <option>Masculino</option><option>Femenino</option><option>Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Teléfono Móvil (9 dígitos) <span className="required">*</span></label>
          <input type="tel" className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} maxLength={9} required value={f.telefono} onChange={set('telefono')} placeholder="987654321" inputMode="numeric" />
          {errors.telefono && <div className="form-error">{errors.telefono}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <input type="email" className="form-control" value={f.email} onChange={set('email')} placeholder="paciente@correo.com" />
        </div>
        <div className="form-group">
          <label className="form-label">Grupo Sanguíneo</label>
          <select className="form-control" value={f.grupoSanguineo} onChange={set('grupoSanguineo')}>
            {GRUPOS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="form-group col-full">
          <label className="form-label">Dirección Domiciliaria</label>
          <input className="form-control" value={f.direccion} onChange={set('direccion')} placeholder="Av./Calle, Número, Distrito" />
        </div>
        <div className="form-group col-full">
          <label className="form-label">Alergias Conocidas</label>
          <input className="form-control" value={f.alergias} onChange={set('alergias')} placeholder="Ej. Penicilina, AINEs (o 'Ninguna')" />
        </div>
        <div className="form-group col-full">
          <label className="form-label">Contacto de Emergencia</label>
          <input className="form-control" value={f.contactoEmergencia} onChange={set('contactoEmergencia')} placeholder="Nombre, parentesco y número de teléfono" />
        </div>
      </form>
    </Modal>
  )
}

function PacienteDetalle({ paciente, onClose }) {
  const navigate = useNavigate()
  return (
    <Modal
      open
      title={`Ficha Clínica: ${paciente.nombres} ${paciente.apellidos}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cerrar</button>
          <button type="button" className="btn btn--primary" onClick={() => { onClose(); navigate('/historias') }}>Ir a Historias Clínicas</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="badge badge--primary" style={{ fontSize: '0.9rem' }}>{paciente.historiaClinica}</span>
            <span className="badge badge--success">{paciente.estado}</span>
          </div>
          <p><strong>DNI:</strong> {paciente.dni} | <strong>Edad:</strong> {paciente.edad ?? '-'} años | <strong>Sexo:</strong> {paciente.genero}</p>
          <p><strong>Grupo Sanguíneo:</strong> {paciente.grupoSanguineo || 'No registrado'} | <strong>Alergias:</strong> <span style={{ color: 'var(--danger-600)', fontWeight: 600 }}>{paciente.alergias}</span></p>
        </div>
        <div>
          <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>Datos de Contacto:</h4>
          <p>📱 {paciente.telefono} | ✉️ {paciente.email || '-'}</p>
          <p>📍 {paciente.direccion || 'Sin dirección'}</p>
          <p>🆘 <strong>Contacto de Emergencia:</strong> {paciente.contactoEmergencia || 'No asignado'}</p>
        </div>
      </div>
    </Modal>
  )
}

export default function Pacientes() {
  const { data, remove } = useStore()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null) // null | 'nuevo' | paciente
  const [detalle, setDetalle] = useState(null)

  const lista = useMemo(() => {
    const t = q.toLowerCase().trim()
    if (!t) return data.pacientes
    return data.pacientes.filter(
      (p) =>
        p.dni.toLowerCase().includes(t) ||
        p.nombres.toLowerCase().includes(t) ||
        p.apellidos.toLowerCase().includes(t) ||
        (p.historiaClinica || '').toLowerCase().includes(t),
    )
  }, [data.pacientes, q])

  const eliminar = (p) => {
    if (!window.confirm(`¿Estás seguro de dar de baja al paciente ${p.nombres} ${p.apellidos} (DNI: ${p.dni})?`)) return
    remove('pacientes', p.id)
    toast.warning(`Paciente ${p.nombres} retirado del padrón activo.`)
  }

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">👥 Padrón y Gestión de Pacientes</h3>
          <p className="card__subtitle">Registro administrativo, datos demográficos e historias clínicas</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setForm('nuevo')}>+ Nuevo Paciente</button>
      </div>

      <div className="action-bar">
        <div className="search-box">
          <span className="search-box__icon">🔍</span>
          <input className="form-control" placeholder="Buscar por DNI, nombres o apellidos..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="button" className="btn btn--outline btn--sm" onClick={() => toast.info('Exportando padrón de pacientes a Excel...')}>📊 Exportar Excel</button>
      </div>

      <div className="table-container">
        <table className="table-modern">
          <thead>
            <tr><th>DNI</th><th>Paciente</th><th>Edad / Género</th><th>Teléfono / Email</th><th>Alergias</th><th>Historia Clínica</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={7} className="empty-row">No se encontraron pacientes registrados.</td></tr>
            ) : (
              lista.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.dni}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{p.nombres} {p.apellidos}</div>
                    <small className="cell-sub">{p.direccion || 'Sin dirección'}</small>
                  </td>
                  <td>{p.edad ? `${p.edad} años` : '-'} · <span className="badge badge--neutral">{p.genero}</span></td>
                  <td>
                    <div>📞 {p.telefono}</div>
                    <small className="cell-sub">{p.email}</small>
                  </td>
                  <td>
                    {p.alergias && p.alergias !== 'Ninguna'
                      ? <span className="badge badge--danger">⚠️ {p.alergias}</span>
                      : <span className="badge badge--success">Ninguna</span>}
                  </td>
                  <td><span className="badge badge--primary">{p.historiaClinica || `HC-${p.dni}`}</span></td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="btn btn--outline btn--sm btn--icon-only" title="Ver Ficha y Antecedentes" onClick={() => setDetalle(p)}>👁️</button>
                      <button type="button" className="btn btn--outline btn--sm btn--icon-only" title="Editar Paciente" onClick={() => setForm(p)}>✏️</button>
                      <button type="button" className="btn btn--danger btn--sm btn--icon-only" title="Dar de Baja" onClick={() => eliminar(p)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {form && <PacienteForm paciente={form === 'nuevo' ? null : form} onClose={() => setForm(null)} />}
      {detalle && <PacienteDetalle paciente={detalle} onClose={() => setDetalle(null)} />}
    </div>
  )
}
