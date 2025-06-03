"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"
import toast from "react-hot-toast"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  // Verify token with backend
  const verifyToken = async (token) => {
    try {
      const response = await authAPI.verify(token)
      setUser(response.data.user)
      localStorage.setItem("token", token)
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth login
  const loginWithGoogle = async (credential) => {
    try {
      setLoading(true)
      const response = await authAPI.googleLogin(credential)

      const { token, user: userData } = response.data
      setUser(userData)
      localStorage.setItem("token", token)

      toast.success(`Welcome back, ${userData.name}!`)
      return true
    } catch (error) {
      console.error("Google login failed:", error)
      toast.error("Login failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("token")
    toast.success("Logged out successfully")
  }

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
