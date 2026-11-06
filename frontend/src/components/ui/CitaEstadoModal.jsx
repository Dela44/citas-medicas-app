import { useState } from 'react'
import Modal from './Modal'
import { useStore } from '../../context/StoreContext'
import { useToast } from './Toast'

/** Modal para cambiar el estado de una cita (usado en Dashboard y Citas). */
export default function CitaEstadoModal({ cita, onClose }) {
  const { update } = useStore()
  const toast = useToast()
  const [estado, setEstado] = useState(cita?.estado || 'Programada')

  if (!cita) return null

  const guardar = async () => {
    try {
      await update('citas', cita.id, { estado })
      toast.success(`Estado de la cita actualizado a "${estado}"`)
      onClose()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <Modal
      open
      title={`Gestionar Cita: ${cita.codigoCita}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cerrar</button>
          <button type="button" className="btn btn--primary" onClick={guardar}>Actualizar Estado</button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p><strong>Paciente:</strong> {cita.pacienteNombre} (DNI: {cita.pacienteDni})</p>
        <p><strong>Médico:</strong> {cita.medicoNombre} - {cita.especialidad}</p>
        <hr style={{ border: 0, borderTop: '1px solid var(--slate-200)' }} />
        <div className="form-group">
          <label className="form-label">Cambiar Estado:</label>
          <select className="form-control" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="Programada">📅 Programada</option>
            <option value="En Espera">⏳ En Espera (Triaje)</option>
            <option value="En Consulta">🩺 En Consulta con Médico</option>
            <option value="Atendido">✅ Atendido / Concluido</option>
            <option value="Cancelado">❌ Cancelado</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}
