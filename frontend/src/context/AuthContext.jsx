import { createContext, useContext, useState, useCallback } from 'react'
import { login as loginRequest } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ferreteria_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password)
    const usuario = {
      username: data.username,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol,
    }
    localStorage.setItem('ferreteria_token', data.token)
    localStorage.setItem('ferreteria_user', JSON.stringify(usuario))
    setUser(usuario)
    return usuario
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ferreteria_token')
    localStorage.removeItem('ferreteria_user')
    setUser(null)
  }, [])

  const esAdmin = user?.rol === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, logout, esAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
