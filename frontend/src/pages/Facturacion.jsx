import { useStore } from '../context/StoreContext'
import { useToast } from '../components/ui/Toast'

export default function Facturacion() {
  const { data } = useStore()
  const toast = useToast()
  const { pagos } = data
  const total = pagos.reduce((s, p) => s + Number(p.monto), 0).toFixed(2)

  return (
    <div className="card">
      <div className="card__header">
        <div>
          <h3 className="card__title">💳 Facturación, Pagos y Caja</h3>
          <p className="card__subtitle">Control de comprobantes de pago (Boletas / Facturas electrónicas)</p>
        </div>
        <span className="badge badge--success" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Total Recaudado: S/ {total}</span>
      </div>

      <div className="table-container" style={{ marginTop: '1rem' }}>
        <table className="table-modern">
          <thead>
            <tr><th>N° Comprobante</th><th>Paciente</th><th>Fecha / Hora</th><th>Método de Pago</th><th>Monto Total</th><th>Estado</th><th>Acción</th></tr>
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
                  <td><strong>{p.paciente}</strong></td>
                  <td>{p.fecha}</td>
                  <td><span className="badge badge--neutral">{p.metodo}</span></td>
                  <td><strong style={{ color: 'var(--medical-700)' }}>S/ {Number(p.monto).toFixed(2)}</strong></td>
                  <td><span className="badge badge--success">{p.estado}</span></td>
                  <td>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => toast.info(`Imprimiendo comprobante electrónico ${p.id}...`)}>🧾 Imprimir Boleta</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
