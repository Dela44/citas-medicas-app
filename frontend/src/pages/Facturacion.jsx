import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'

function PagoModal({ onClose }) {
  const { data, insert } = useStore()
  const toast = useToast()
  const [form, setForm] = useState({ citaId: '', cajeroId: '', monto: '', metodo: 'Efectivo', estado: 'Pagado' })
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    try {
      await insert('pagos', { ...form, citaId: Number(form.citaId), cajeroId: Number(form.cajeroId), monto: Number(form.monto) })
      toast.success('Pago registrado correctamente.')
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal open title="Registrar pago" onClose={onClose} footer={
      <>
        <button type="button" className="btn btn--outline" onClick={onClose}>Cancelar</button>
        <button type="submit" form="formPago" className="btn btn--primary">Guardar pago</button>
      </>
    }>
      <form id="formPago" className="form-grid" onSubmit={submit}>
        <div className="form-group col-full">
          <label className="form-label">Cita <span className="required">*</span></label>
          <select className="form-control" required value={form.citaId} onChange={set('citaId')}>
            <option value="">Seleccione cita</option>
            {data.citas.map((cita) => <option key={cita.id} value={cita.id}>{cita.codigoCita} · {cita.pacienteNombre} · {cita.fecha} {cita.hora}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Cajero <span className="required">*</span></label>
          <select className="form-control" required value={form.cajeroId} onChange={set('cajeroId')}>
            <option value="">Seleccione cajero</option>
            {data.cajeros.map((cajero) => <option key={cajero.id} value={cajero.id}>{cajero.nombres} {cajero.apellidos}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Monto (S/) <span className="required">*</span></label>
          <input type="number" min="0.01" step="0.01" required className="form-control" value={form.monto} onChange={set('monto')} />
        </div>
        <div className="form-group">
          <label className="form-label">Método de pago <span className="required">*</span></label>
          <select className="form-control" value={form.metodo} onChange={set('metodo')}>
            <option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option><option>Yape/Plin</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-control" value={form.estado} onChange={set('estado')}>
            <option>Pagado</option><option>Pendiente</option><option>Anulado</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}

export default function Facturacion() {
  const { data } = useStore()
  const [nuevo, setNuevo] = useState(false)
  const { pagos } = data
  const total = pagos.filter((pago) => pago.estado === 'Pagado').reduce((s, pago) => s + Number(pago.monto), 0).toFixed(2)

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">💳 Facturación, Pagos y Caja</h3>
          <p className="card__subtitle">Pagos asociados a citas y cajeros</p>
        </div>
        <span className="badge badge--success" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Total Recaudado: S/ {total}</span>
        <button type="button" className="btn btn--primary" onClick={() => setNuevo(true)}>+ Registrar pago</button>
      </div>

      <div className="table-container" style={{ marginTop: '1rem' }}>
        <table className="table-modern">
          <thead>
            <tr><th>Pago</th><th>Cita</th><th>Paciente</th><th>Fecha / Hora</th><th>Método</th><th>Monto</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-box">
                  <div className="empty-box__icon">🧾</div>
                  <strong>No hay comprobantes ni pagos emitidos</strong>
                  <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 4 }}>Los cobros de consultas y atenciones se registrarán aquí automáticamente.</p>
                </td>
              </tr>
            ) : (
              pagos.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.id}</strong></td>
                  <td>{`CIT-${p.citaId}`}</td>
                  <td><strong>{p.paciente}</strong></td>
                  <td>{p.fecha}</td>
                  <td><span className="badge badge--neutral">{p.metodo}</span></td>
                  <td><strong style={{ color: 'var(--medical-700)' }}>S/ {Number(p.monto).toFixed(2)}</strong></td>
                  <td><span className="badge badge--success">{p.estado}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {nuevo && <PagoModal onClose={() => setNuevo(false)} />}
    </div>
  )
}
