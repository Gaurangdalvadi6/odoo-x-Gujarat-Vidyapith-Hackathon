import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'learnova_auth'

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    setAuthToken(auth?.token)
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  const login = async (payload) => {
    const { data } = await api.post('/api/auth/login', payload)
    setAuth(data)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    setAuth(data)
    return data
  }

  const logout = () => setAuth(null)

  const value = useMemo(
    () => ({
      auth,
      isLoggedIn: Boolean(auth?.token),
      role: auth?.role,
      userId: auth?.userId,
      login,
      register,
      logout,
    }),
    [auth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return context
}
