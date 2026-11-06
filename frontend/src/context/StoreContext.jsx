import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createRecord, deleteRecord, loadAll, updateRecord } from '../services/storeService'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAll()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const insert = useCallback(async (col, item) => {
    const record = await createRecord(col, item)
    setData((prev) => ({ ...prev, [col]: [record, ...(prev[col] || [])] }))
    return record
  }, [])

  const update = useCallback(async (col, id, patch) => {
    const record = await updateRecord(col, id, patch)
    setData((prev) => ({
      ...prev,
      [col]: (prev[col] || []).map((item) => (item.id === id ? record : item)),
    }))
    return record
  }, [])

  const remove = useCallback(async (col, id) => {
    await deleteRecord(col, id)
    setData((prev) => ({ ...prev, [col]: (prev[col] || []).filter((o) => o.id !== id) }))
  }, [])

  const value = useMemo(() => ({ data, loading, error, insert, update, remove }), [data, loading, error, insert, update, remove])
  if (loading) return <div className="api-state">Conectando con el backend...</div>
  if (error) return <div className="api-state api-state--error">{error}</div>
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
