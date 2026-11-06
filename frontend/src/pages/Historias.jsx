import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'
import { hoyISO } from '../utils/dates'

function calcularImc(peso, talla) {
  const p = Number(peso)
  const t = Number(talla)
  if (!p || !t) return '-'
  return (p / (t * t)).toFixed(1)
}

function AtencionModal({ onClose }) {
  const { data, insert } = useStore()
  const toast = useToast()
  const { pacientes, medicos, enfermeros } = data
  const [f, setF] = useState({
    pacienteId: String(pacientes[0].id), medicoId: String(medicos[0].id), enfermeroId: '', fecha: hoyISO(),
    pa: '', temp: '', peso: '', talla: '', frecuenciaCardiaca: '', diagnostico: '', tratamiento: '',
  })
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const medico = medicos.find((m) => String(m.id) === f.medicoId)
    const decimal = (value) => value ? Number(value.replace(',', '.')) : null
    try {
      await insert('historiasClinicas', {
        pacienteId: Number(f.pacienteId),
        medicoId: Number(f.medicoId),
        fechaConsulta: f.fecha,
        diagnostico: f.diagnostico.trim(),
        tratamiento: f.tratamiento.trim(),
        triaje: {
          enfermeroId: Number(f.enfermeroId),
          peso: decimal(f.peso),
          altura: decimal(f.talla),
          presion: f.pa.trim(),
          temperatura: decimal(f.temp),
          frecuenciaCardiaca: f.frecuenciaCardiaca ? Number(f.frecuenciaCardiaca) : null,
        },
      })
      toast.success(`Consulta registrada para ${medico.nombres} ${medico.apellidos}.`)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      open
      title="🩺 Nueva Consulta y Evolución Médica"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
          <button type="submit" form="formHce" className="btn btn--medical">Guardar Registro Clínico</button>
        </>
      }
    >
      <form id="formHce" className="form-grid" onSubmit={submit}>
        <div className="form-group col-full">
          <label className="form-label">Paciente <span className="required">*</span></label>
          <select className="form-control" required value={f.pacienteId} onChange={set('pacienteId')}>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} - {p.historiaClinica} (DNI: {p.dni})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Médico Tratante <span className="required">*</span></label>
          <select className="form-control" required value={f.medicoId} onChange={set('medicoId')}>
            {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombres} {m.apellidos} ({m.especialidad})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Atención <span className="required">*</span></label>
          <input type="date" className="form-control" required value={f.fecha} onChange={set('fecha')} />
        </div>
        <div className="form-group">
          <label className="form-label">Enfermero de triaje <span className="required">*</span></label>
          <select className="form-control" required value={f.enfermeroId} onChange={set('enfermeroId')}>
            <option value="">Seleccione enfermero</option>
            {enfermeros.map((n) => <option key={n.id} value={n.id}>{n.nombres} {n.apellidos}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Presión Arterial</label>
          <input className="form-control" placeholder="120/80" value={f.pa} onChange={set('pa')} />
        </div>
        <div className="form-group">
          <label className="form-label">Temperatura (°C)</label>
          <input type="number" step="0.01" min="25" max="45" className="form-control" placeholder="36.8" value={f.temp} onChange={set('temp')} />
        </div>
        <div className="form-group">
          <label className="form-label">Peso (kg)</label>
          <input type="number" step="0.01" min="1" className="form-control" placeholder="70" value={f.peso} onChange={set('peso')} />
        </div>
        <div className="form-group">
          <label className="form-label">Altura (m)</label>
          <input type="number" step="0.01" min="0.3" max="2.5" className="form-control" placeholder="1.70" value={f.talla} onChange={set('talla')} />
        </div>
        <div className="form-group">
          <label className="form-label">Frecuencia cardíaca (lpm)</label>
          <input type="number" min="1" max="300" className="form-control" value={f.frecuenciaCardiaca} onChange={set('frecuenciaCardiaca')} />
        </div>
        <div className="form-group col-full">
          <label className="form-label">Diagnóstico (CIE-10) <span className="required">*</span></label>
          <input className="form-control" required value={f.diagnostico} onChange={set('diagnostico')} placeholder="Ej. J00 - Rinofaringitis aguda (resfriado común)" />
        </div>
        <div className="form-group col-full">
          <label className="form-label">Plan de Tratamiento / Receta de Medicamentos <span className="required">*</span></label>
          <textarea className="form-control" rows={2} required value={f.tratamiento} onChange={set('tratamiento')} placeholder="Fármaco, dosis, vía de administración y duración..." />
        </div>
      </form>
    </Modal>
  )
}

function LaboratorioModal({ historia, pacienteNombre, onClose }) {
  const { data, insert } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ tipoExamen: '', resultados: '', observaciones: '' })
  const examenes = data.laboratorios.filter((examen) => examen.pacienteId === historia.pacienteId)
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    try {
      await insert('laboratorios', {
        pacienteId: historia.pacienteId,
        medicoId: historia.medicoId,
        ...form,
      })
      toast.success('Resultado de laboratorio registrado.')
      setForm({ tipoExamen: '', resultados: '', observaciones: '' })
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal open title="Exámenes de laboratorio" onClose={onClose} footer={
      <button type="button" className="btn btn--outline" onClick={onClose}>Cerrar</button>
    }>
      <div className="stack">
        <div>
          <strong>{pacienteNombre}</strong>
          {examenes.length === 0 ? <p className="cell-sub">No hay resultados registrados para este paciente.</p> : examenes.map((examen) => (
            <div key={examen.id} style={{ borderBottom: '1px solid var(--border-color)', padding: '0.6rem 0' }}>
              <strong>{examen.tipoExamen}</strong> · {examen.fechaResultado}
              <p>{examen.resultados}</p>
              {examen.observaciones && <small className="cell-sub">{examen.observaciones}</small>}
            </div>
          ))}
        </div>
        <form id="formLaboratorio" className="form-grid" onSubmit={submit}>
          <div className="form-group col-full">
            <label className="form-label">Tipo de examen <span className="required">*</span></label>
            <input className="form-control" required maxLength={150} value={form.tipoExamen} onChange={set('tipoExamen')} />
          </div>
          <div className="form-group col-full">
            <label className="form-label">Resultados <span className="required">*</span></label>
            <textarea className="form-control" required rows={3} value={form.resultados} onChange={set('resultados')} />
          </div>
          <div className="form-group col-full">
            <label className="form-label">Observaciones</label>
            <textarea className="form-control" rows={2} value={form.observaciones} onChange={set('observaciones')} />
          </div>
        </form>
        <button type="submit" form="formLaboratorio" className="btn btn--primary">Registrar resultado</button>
      </div>
    </Modal>
  )
}

export default function Historias() {
  const { data, remove } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [nueva, setNueva] = useState(false)
  const [laboratorio, setLaboratorio] = useState(null)
  const { historiasClinicas: historias, pacientes } = data

  const abrirNueva = () => {
    if (pacientes.length === 0) {
      window.alert('No hay pacientes registrados. Primero registre un paciente en el padrón.')
      navigate('/pacientes')
      return
    }
    if (data.medicos.length === 0) {
      window.alert('No hay médicos disponibles para registrar la atención. Registre un médico primero.')
      navigate('/medicos')
      return
    }
    setNueva(true)
  }

  const eliminar = async (h) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro clínico / evolución de la historia?')) return
    try {
      await remove('historiasClinicas', h.id)
      toast.warning('Registro de historia clínica eliminado.')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">📁 Historias Clínicas Electrónicas (HCE)</h3>
          <p className="card__subtitle">Registro de evoluciones, triaje, diagnósticos y prescripciones médicas</p>
        </div>
        <button type="button" className="btn btn--medical" onClick={abrirNueva}>+ Registrar Consulta / Evolución</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {historias.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--slate-50)', border: '1px dashed var(--slate-300)', borderRadius: 'var(--radius-md)', color: 'var(--slate-500)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📁</div>
            <strong style={{ fontSize: '1.1rem', color: 'var(--slate-700)' }}>No hay atenciones ni historias clínicas registradas</strong>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 4 }}>Las atenciones aparecerán conforme se registren consultas o evoluciones médicas.</p>
          </div>
        ) : (
          historias.map((h) => {
            const pac = pacientes.find((p) => p.id === h.pacienteId) || { nombres: 'Paciente', apellidos: 'General', dni: '00000000', historiaClinica: 'HC-000' }
            const t = h.triaje || {}
            return (
              <div key={h.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: 'var(--slate-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span className="badge badge--primary" style={{ fontSize: '0.85rem' }}>{pac.historiaClinica}</span>
                    <strong style={{ fontSize: '1.05rem', marginLeft: '0.5rem', color: 'var(--slate-900)' }}>{pac.nombres} {pac.apellidos}</strong>
                    <span style={{ color: 'var(--slate-500)', fontSize: 'var(--font-size-xs)' }}> (DNI: {pac.dni})</span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--slate-500)' }}>
                    📅 Fecha Atención: <strong>{h.fechaConsulta}</strong> · 👨‍⚕️ <strong>{h.medico}</strong> ({h.especialidad})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', background: '#fff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)', marginBottom: '0.75rem' }}>
                  <div><strong>P.A:</strong> {t.presion || '-'}</div>
                  <div><strong>Temp:</strong> {t.temperatura || '-'}</div>
                  <div><strong>Peso:</strong> {t.peso ? `${t.peso} kg` : '-'}</div>
                  <div><strong>Altura:</strong> {t.altura ? `${t.altura} m` : '-'}</div>
                  <div><strong>FC:</strong> {t.frecuenciaCardiaca ? `${t.frecuenciaCardiaca} lpm` : '-'}</div>
                  <div><strong>IMC:</strong> {t.peso && t.altura ? calcularImc(t.peso, t.altura) : '-'}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                  <div>
                    <strong style={{ color: 'var(--slate-700)' }}>Diagnóstico Presuntivo / Definitivo:</strong>
                    <p style={{ color: 'var(--primary-700)', fontWeight: 600, marginTop: 2 }}>🩺 {h.diagnostico}</p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--slate-700)' }}>Plan Terapéutico y Receta:</strong>
                    <p style={{ color: 'var(--medical-700)', fontWeight: 500, marginTop: 2 }}>💊 {h.tratamiento}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => toast.info('Generando Receta Médica oficial en PDF...')}>🖨️ Imprimir Receta</button>
                  <button type="button" className="btn btn--outline btn--sm" onClick={() => setLaboratorio(h)}>🧪 Ver Exámenes</button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => eliminar(h)}>🗑️ Eliminar Ficha</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {nueva && <AtencionModal onClose={() => setNueva(false)} />}
      {laboratorio && <LaboratorioModal historia={laboratorio} pacienteNombre={`${pacientes.find((paciente) => paciente.id === laboratorio.pacienteId)?.nombres || ''} ${pacientes.find((paciente) => paciente.id === laboratorio.pacienteId)?.apellidos || ''}`} onClose={() => setLaboratorio(null)} />}
    </div>
  )
}
