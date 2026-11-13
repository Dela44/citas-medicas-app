import { MOCK_DATA } from '../data/mockDb'

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const API_URL = configuredApiUrl.endsWith('/api')
  ? configuredApiUrl
  : `${configuredApiUrl}/api`

const ENDPOINTS = {
  pacientes: 'pacientes',
  medicos: 'medicos',
  especialidades: 'especialidades',
  citas: 'citas',
  historiasClinicas: 'historias-clinicas',
  laboratorios: 'laboratorio',
  pagos: 'pagos',
  triajes: 'triajes',
  recepcionistas: 'recepcionistas',
  enfermeros: 'enfermeros',
  cajeros: 'cajeros',
}

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}/${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('tusalud_token')
          ? { Authorization: `Bearer ${localStorage.getItem('tusalud_token')}` }
          : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error('No se pudo conectar con el backend. Comprueba que el servidor esté activo.')
  }

  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error || 'La operación no pudo completarse.')
  return body
}

export async function loadAll() {
  const data = await Promise.all(Object.entries(ENDPOINTS).map(async ([collection, path]) => [
    collection,
    await apiRequest(path),
  ]))
  const result = { ...structuredClone(MOCK_DATA), ...Object.fromEntries(data) }
  result.historiasClinicas = result.historiasClinicas.map((historia) => ({
    ...historia,
    triaje: result.triajes.find((item) => item.pacienteId === historia.pacienteId && item.fechaRegistro.slice(0, 10) === historia.fechaConsulta.slice(0, 10)) || null,
  }))
  return result
}

export function createRecord(collection, item) {
  return apiRequest(ENDPOINTS[collection], { method: 'POST', body: JSON.stringify(item) })
}

export function updateRecord(collection, id, patch) {
  return apiRequest(`${ENDPOINTS[collection]}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function deleteRecord(collection, id) {
  return apiRequest(`${ENDPOINTS[collection]}/${id}`, { method: 'DELETE' })
}
