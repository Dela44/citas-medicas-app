import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadAll, saveAll } from '../services/storeService'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadAll)

  useEffect(() => {
    saveAll(data)
  }, [data])

  const insert = useCallback((col, item) => {
    setData((prev) => {
      const list = prev[col] || []
      const id = item.id ?? list.reduce((max, o) => (o.id > max ? o.id : max), 0) + 1
      return { ...prev, [col]: [{ ...item, id }, ...list] }
    })
  }, [])

  const update = useCallback((col, id, patch) => {
    setData((prev) => ({
      ...prev,
      [col]: (prev[col] || []).map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }))
  }, [])

  const remove = useCallback((col, id) => {
    setData((prev) => ({ ...prev, [col]: (prev[col] || []).filter((o) => o.id !== id) }))
  }, [])

  const clearAll = useCallback(() => {
    setData((prev) => ({ ...prev, pacientes: [], medicos: [], citas: [], historiasClinicas: [], pagos: [] }))
  }, [])

  const value = useMemo(() => ({ data, insert, update, remove, clearAll }), [data, insert, update, remove, clearAll])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
