import { createContext, useState, useEffect } from 'react'
import { login as authLogin, logout as authLogout } from '../services/authService'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('sh_user')
      // If token exists in localStorage, keep it
      const token = localStorage.getItem('sh_token')
      if (token) api.setToken(token)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('sh_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('sh_user')
    }
  }, [user])

  // register a handler so that when api detects refresh failure we logout here
  useEffect(() => {
    const handler = () => {
      authLogout()
      setUser(null)
      // navigate to login page
      try { window.location.href = '/login' } catch (e) {}
    }
    api.setOnAuthFailure && api.setOnAuthFailure(handler)
    return () => { if (api.setOnAuthFailure) api.setOnAuthFailure(null) }
  }, [])

  const login = async (credentials) => {
    const res = await authLogin(credentials)
    setUser(res.user || { email: credentials.email })
    // token is set by authService via api.setToken
    return res
  }

  const logout = () => {
    authLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
