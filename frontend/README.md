# Frontend – Sistema de Citas Médicas (Centro Médico SENATI)

React 18 + Vite. Migración del prototipo `sistema-medico` (HTML/CSS/JS puro) con el mismo diseño y funciones.

## Ejecutar
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Estructura (`src/`)
- `pages/` Dashboard, Citas, Pacientes, Historias, Medicos, Facturacion
- `components/layout/Layout.jsx` sidebar + topbar · `components/ui/` Modal, Toast, CitaEstadoModal
- `context/StoreContext.jsx` estado global (insert / update / remove / clearAll)
- `services/storeService.js` persistencia en LocalStorage (clave `CLINICA_SENATI_DATA`)
- `data/` datos base, iconos y rutas · `styles/` variables, layout, components, extras

## Conexión con el backend
Los datos se guardan hoy en LocalStorage. Para usar la API Express (`/api/pacientes`, `/api/medicos`)
hay que reemplazar `storeService.js`/`StoreContext.jsx` por llamadas `fetch`; el esquema MySQL actual
del backend es más reducido (no tiene CMP, horario, alergias, citas, historias ni pagos).
