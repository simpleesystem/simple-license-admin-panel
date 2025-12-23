import type { User } from '@/simpleLicense'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '@/api/apiContext'
import type { LoginCredentials } from '@/types/auth'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useApiClient()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use a ref to track if we've already attempted initialization
  // This helps prevents double-fetching in StrictMode
  const initialized = useRef(false)

  const fetchUser = useCallback(async () => {
    try {
      const userData = await client.getCurrentUser()
      if (userData?.user) {
        setUser(userData.user)
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err)
      setUser(null)
    }
  }, [client])

  const initSession = useCallback(async () => {
    if (initialized.current) {
      return
    }
    initialized.current = true

    setIsLoading(true)
    setError(null)

    try {
      // 1. Try to restore session via HttpOnly cookie
      const token = await client.restoreSession()

      if (token) {
        // 2. If we have a token, fetch the user details
        await fetchUser()
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Session restoration failed:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [client, fetchUser])

  useEffect(() => {
    initSession()
  }, [initSession])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await client.login(credentials.username, credentials.password)
        if (response.user) {
          setUser(response.user)
        }
      } catch (err: unknown) {
        console.error('Login failed:', err)
        const message = err instanceof Error ? err.message : 'Login failed'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [client]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await client.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [client])

  const value = {
    user,
    currentUser: user, // Add alias
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshCurrentUser: fetchUser, // Expose fetchUser as refreshCurrentUser
    error,
  }

  if (isLoading) {
    // Return nothing or a spinner while checking session
    // This prevents the "flash of unauthenticated content"
    return null
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
