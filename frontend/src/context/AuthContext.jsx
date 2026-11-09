import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../services/storeService'

const AuthContext = createContext(null)
const TOKEN_KEY = 'tusalud_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    apiRequest('auth/me')
      .then(({ user: sessionUser }) => setUser(sessionUser))
      .catch((error) => {
        localStorage.removeItem(TOKEN_KEY)
        setSessionError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const saveSession = useCallback(({ token, user: sessionUser }) => {
    localStorage.setItem(TOKEN_KEY, token)
    setUser(sessionUser)
    return sessionUser
  }, [])

  const login = useCallback(async (credentials) => {
    const session = await apiRequest('auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    return saveSession(session)
  }, [saveSession])

  const register = useCallback(async (details) => {
    const session = await apiRequest('auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    return saveSession(session)
  }, [saveSession])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, sessionError, login, register, logout }),
    [user, loading, sessionError, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
