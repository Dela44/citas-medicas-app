/**
 * Persistencia en LocalStorage (misma clave que el sistema original).
 * Es la única capa que habría que reemplazar por llamadas a la API REST del backend.
 */
import { MOCK_DATA } from '../data/mockDb'

export const STORAGE_KEY = 'CLINICA_SENATI_DATA'

export function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...structuredClone(MOCK_DATA), ...JSON.parse(raw) }
  } catch (e) {
    console.error('Error al leer LocalStorage:', e)
  }
  return structuredClone(MOCK_DATA)
}

export function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Error al guardar en LocalStorage:', e)
  }
}
