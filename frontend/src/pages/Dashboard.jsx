import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import CitaEstadoModal from '../components/ui/CitaEstadoModal'

const estadoBadge = (e) => (e === 'En Espera' ? 'badge--warning' : e === 'En Consulta' ? 'badge--primary' : e === 'Atendido' ? 'badge--success' : 'badge--neutral')

export default function Dashboard() {
  const { data, remove } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [gestionar, setGestionar] = useState(null)
  const { citas, medicos, pagos } = data

  const pacientesEspera = citas.filter((c) => c.estado === 'En Espera').length
  const medicosDisponibles = medicos.filter((m) => m.estado === 'Disponible').length
  const ingresos = pagos.reduce((s, p) => s + Number(p.monto), 0).toFixed(2)

  const eliminar = (c) => {
    if (!window.confirm(`¿Estás seguro de eliminar el registro de la cita ${c.codigoCita}? Esta acción retirará la cita de forma permanente.`)) return
    remove('citas', c.id)
    toast.warning(`Cita ${c.codigoCita} eliminada correctamente.`)
  }

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-card__label">Citas Programadas Hoy</div>
            <div className="kpi-card__value">{citas.length}</div>
            <div className="kpi-card__trend kpi-card__trend--up"><span>↑ 12%</span> vs ayer</div>
          </div>
          <div className="kpi-card__icon-wrap icon-blue">📅</div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-card__label">Pacientes en Espera</div>
            <div className="kpi-card__value">{pacientesEspera}</div>
            <div className="kpi-card__trend"><span style={{ color: 'var(--warning-600)' }}>Tiempo prom: 14 min</span></div>
          </div>
          <div className="kpi-card__icon-wrap icon-amber">⏳</div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-card__label">Médicos en Consulta / Turno</div>
            <div className="kpi-card__value">{medicosDisponibles} / {medicos.length}</div>
            <div className="kpi-card__trend kpi-card__trend--up"><span>● 100%</span> cobertura</div>
          </div>
          <div className="kpi-card__icon-wrap icon-green">🩺</div>
        </div>
        <div className="kpi-card">
          <div>
            <div className="kpi-card__label">Recaudación del Día</div>
            <div className="kpi-card__value">S/ {ingresos}</div>
            <div className="kpi-card__trend kpi-card__trend--up"><span>↑ +S/ 140.00</span> boletas</div>
          </div>
          <div className="kpi-card__icon-wrap icon-blue">💳</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card__header">
            <div>
              <h3 className="card__title">📋 Citas y Turnos de Hoy</h3>
              <p className="card__subtitle">Monitoreo en tiempo real de flujo asistencial</p>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('/citas')}>+ Nueva Cita</button>
          </div>
          <div className="table-container">
            <table className="table-modern">
              <thead>
                <tr><th>Hora</th><th>Paciente</th><th>Médico / Especialidad</th><th>Consultorio</th><th>Estado</th><th>Acción</th></tr>
              </thead>
              <tbody>
                {citas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-box">
                      <div className="empty-box__icon">📅</div>
                      <strong>No hay citas programadas para el día de hoy.</strong>
                      <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 4 }}>Usa el botón &quot;+ Nueva Cita&quot; para agendar una atención.</p>
                    </td>
                  </tr>
                ) : (
                  citas.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.hora}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.pacienteNombre}</div>
                        <small className="cell-sub">DNI: {c.pacienteDni}</small>
                      </td>
                      <td>
                        <div>{c.medicoNombre}</div>
                        <small style={{ color: 'var(--primary-600)', fontWeight: 600 }}>{c.especialidad}</small>
                      </td>
                      <td><span className="badge badge--neutral">{c.consultorio}</span></td>
                      <td><span className={`badge ${estadoBadge(c.estado)}`}>{c.estado}</span></td>
                      <td>
                        <div className="row-actions">
                          <button type="button" className="btn btn--outline btn--sm" onClick={() => setGestionar(c)}>Gestionar</button>
                          <button type="button" className="btn btn--danger btn--sm btn--icon-only" title="Eliminar Registro de Cita" onClick={() => eliminar(c)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="card__header"><h3 className="card__title">👨‍⚕️ Médicos de Turno</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {medicos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-400)', fontSize: 'var(--font-size-xs)' }}>
                  👨‍⚕️ No hay médicos registrados de turno.
                </div>
              ) : (
                medicos.map((m) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed var(--slate-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ fontSize: '1.5rem' }}>{m.foto}</div>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{m.nombres} {m.apellidos}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--slate-500)' }}>{m.especialidad} · Cons. {m.consultorio}</div>
                      </div>
                    </div>
                    <span className={`badge ${m.estado === 'Disponible' ? 'badge--success' : 'badge--warning'}`}>{m.estado}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff' }}>
            <h4 style={{ fontSize: 'var(--font-size-base)', marginBottom: '0.5rem' }}>🏥 Policlínico SENATI</h4>
            <p style={{ fontSize: 'var(--font-size-xs)', opacity: 0.9, marginBottom: '1rem' }}>
              Sistema Asistencial y Administrativo en línea. Sede Activa: Lima Norte.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn--sm" style={{ background: '#fff', color: 'var(--primary-700)', fontWeight: 700 }} onClick={() => navigate('/pacientes')}>Padrón Pacientes</button>
              <button type="button" className="btn btn--sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }} onClick={() => toast.info('Generando reporte en PDF...')}>Reporte del Día</button>
            </div>
          </div>
        </div>
      </div>

      {gestionar && <CitaEstadoModal cita={gestionar} onClose={() => setGestionar(null)} />}
    </>
  )
}
