import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as logoutApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const loginSuccess = (data) => {
    localStorage.setItem('access',  data.access)
    localStorage.setItem('refresh', data.refresh)
    setUser(data.user)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh')
    try { if (refresh) await logoutApi(refresh) } catch {}
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginSuccess, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
