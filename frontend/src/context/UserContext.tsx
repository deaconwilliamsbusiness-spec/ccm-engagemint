'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Load user from localStorage and fetch profile
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token')
      if (token && token !== 'demo_skip_token') {
        try {
          // Fetch user profile from API
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data.user) {
              setUser({
                id: data.data.user.id,
                username: data.data.user.username,
                email: data.data.user.email
              })
            }
          } else {
            // Token invalid, clear it
            localStorage.removeItem('auth_token')
          }
        } catch (error) {
          console.error('Failed to load user:', error)
        }
      }
    }

    loadUser()
  }, [])

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const isAuthenticated = user !== null

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
