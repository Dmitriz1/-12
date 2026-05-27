import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const register = useCallback(async (username, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.register(username, password)
      const { token: newToken } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser({ username })
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка регистрации'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.login(username, password)
      const { token: newToken } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser({ username })
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка входа'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  const changePassword = useCallback(async (oldPassword, newPassword) => {
    setIsLoading(true)
    setError(null)
    try {
      await authAPI.changePassword(oldPassword, newPassword)
      return { success: true }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Ошибка смены пароля'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshAuthToken = useCallback(async () => {
    if (!token) return false
    try {
      const response = await authAPI.refreshToken(token)
      const { token: newToken } = response.data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      return true
    } catch (err) {
      logout()
      return false
    }
  }, [token])

  // Check if token is still valid on mount
  useEffect(() => {
    if (token) {
      setUser({ token })
    }
  }, [token])

  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    changePassword,
    refreshAuthToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
