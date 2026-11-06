import { useEffect } from 'react'

export default function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div className={`modal-overlay ${open ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      {open && (
        <div className="modal-window" role="dialog" aria-modal="true">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      )}
    </div>
  )
}
