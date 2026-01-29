import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '@/api/apiContext'
import { useLogger } from '@/app/logging/loggerContext'
import type { User } from '@/simpleLicense'
import { ApiException, ERROR_CODE_MUST_CHANGE_PASSWORD } from '@/simpleLicense'
import type { LoginCredentials } from '@/types/auth'
import {
  APP_ERROR_TYPE_AUTH,
  AUTH_STATUS_IDLE,
  STORAGE_KEY_AUTH_EXPIRY,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../constants'
import { useAppStore } from '../state/store'
import { AuthContext } from './authContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useApiClient()
  const logger = useLogger()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use a ref to track if we've already attempted initialization
  // This helps prevents double-fetching in StrictMode
  const initialized = useRef(false)
  // Use a ref to track current user for fetchUser callback
  const userRef = useRef<User | null>(null)

  const fetchUser = useCallback(
    async (retainExistingUser = false) => {
      // Skip if no token is available
      const token = client.getToken()
      if (!token) {
        setUser(null)
        userRef.current = null
        useAppStore.getState().dispatch({
          type: 'auth/setUser',
          payload: null,
        })
        return
      }

      try {
        const userData = await client.getCurrentUser()
        if (userData?.user) {
          setUser(userData.user)
          userRef.current = userData.user
          // Dispatch to Zustand store to keep global state in sync
          useAppStore.getState().dispatch({
            type: 'auth/setUser',
            payload: userData.user,
          })
        } else {
          // If no user in response but we have an existing user and retainExistingUser is true, keep it
          // This handles cases where the API returns empty payload but user is still valid
          const currentUser = userRef.current
          if (!retainExistingUser || !currentUser) {
            setUser(null)
            userRef.current = null
            useAppStore.getState().dispatch({
              type: 'auth/setUser',
              payload: null,
            })
          }
        }
      } catch (err) {
        logger.error(err, { message: 'Failed to fetch user details' })

        // Check if this is a password reset required error
        if (err instanceof ApiException) {
          const isPasswordResetError =
            err.errorCode === ERROR_CODE_MUST_CHANGE_PASSWORD ||
            (err.errorCode === 'AUTHORIZATION_ERROR' && err.errorDetails?.status === 403)

          if (isPasswordResetError) {
            // Set user with passwordResetRequired flag
            const currentUser = userRef.current
            if (currentUser) {
              const userWithResetRequired: User = {
                ...currentUser,
                passwordResetRequired: true,
              }
              setUser(userWithResetRequired)
              userRef.current = userWithResetRequired
              useAppStore.getState().dispatch({
                type: 'auth/setUser',
                payload: userWithResetRequired,
              })
              return
            }
          }
        }

        // On error, only clear user if we're not retaining existing user
        const currentUser = userRef.current
        if (!retainExistingUser || !currentUser) {
          setUser(null)
          userRef.current = null
          useAppStore.getState().dispatch({
            type: 'auth/setUser',
            payload: null,
          })
        }
      }
    },
    [client, logger]
  )

  const initSession = useCallback(async () => {
    if (initialized.current) {
      return
    }
    initialized.current = true

    setIsLoading(true)
    setError(null)

    // Check for expired tokens in localStorage and clear them
    const expiry = window.localStorage.getItem(STORAGE_KEY_AUTH_EXPIRY)
    if (expiry) {
      const expiryTime = Number.parseInt(expiry, 10)
      if (expiryTime && expiryTime < Date.now()) {
        // Token is expired, clear it
        window.localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN)
        window.localStorage.removeItem(STORAGE_KEY_AUTH_EXPIRY)
        window.localStorage.removeItem(STORAGE_KEY_AUTH_USER)
      }
    }

    try {
      // 1. Try to restore session via HttpOnly cookie
      const token = await client.restoreSession()

      if (token) {
        // 2. If we have a token, fetch the user details
        await fetchUser()
      } else {
        setUser(null)
        userRef.current = null
        useAppStore.getState().dispatch({
          type: 'auth/setUser',
          payload: null,
        })
      }
    } catch (err) {
      logger.error(err, { message: 'Session restoration failed' })
      setUser(null)
      useAppStore.getState().dispatch({
        type: 'auth/setUser',
        payload: null,
      })
    } finally {
      setIsLoading(false)
    }
  }, [client, fetchUser, logger])

  useEffect(() => {
    initSession()
  }, [initSession])

  // Listen for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_AUTH_TOKEN && e.newValue === null) {
        // Another tab cleared the token, log out
        setUser(null)
        userRef.current = null
        client.setToken(null)
        useAppStore.getState().dispatch({
          type: 'auth/setUser',
          payload: null,
        })
      } else if (e.key === STORAGE_KEY_AUTH_USER && e.newValue) {
        // Another tab updated the user, sync it
        try {
          const updatedUser = JSON.parse(e.newValue) as User
          setUser(updatedUser)
          userRef.current = updatedUser
          useAppStore.getState().dispatch({
            type: 'auth/setUser',
            payload: updatedUser,
          })
        } catch (err) {
          logger.error(err, { message: 'Failed to parse user from storage event' })
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [client, logger])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await client.login(credentials.username, credentials.password)
        if (response.user) {
          // Check if password reset is required from login response
          const mustChangePassword = response.must_change_password ?? response.mustChangePassword ?? false
          const userWithResetFlag: User = {
            ...response.user,
            passwordResetRequired: mustChangePassword || response.user.passwordResetRequired || false,
          }
          setUser(userWithResetFlag)
          userRef.current = userWithResetFlag
          // Dispatch to Zustand store to keep global state in sync
          useAppStore.getState().dispatch({
            type: 'auth/setUser',
            payload: userWithResetFlag,
          })
          // If password reset is required, don't fetch user (it will fail with 403)
          // Otherwise, refresh user to ensure we have the latest state from the server
          if (!userWithResetFlag.passwordResetRequired) {
            await fetchUser(true)
          }
        }
      } catch (err: unknown) {
        logger.error(err instanceof Error ? err : new Error(String(err)), { message: 'Login failed' })
        const message = err instanceof Error ? err.message : 'Login failed'

        // Clear token and user state on login failure
        client.setToken(null)
        setUser(null)
        userRef.current = null
        useAppStore.getState().dispatch({
          type: 'auth/setUser',
          payload: null,
        })

        // Dispatch error to global store
        const errorRecord = err as Record<string, unknown>
        const errorCode = (errorRecord.errorCode as string) || (errorRecord.code as string) || 'UNKNOWN_ERROR'
        useAppStore.getState().dispatch({
          type: 'error/raise',
          payload: {
            code: errorCode,
            message,
            scope: 'auth',
            status: errorRecord.status as number | undefined,
            type: APP_ERROR_TYPE_AUTH, // Default to auth error for auth failures
          },
        })

        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [client, fetchUser, logger]
  )

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await client.logout()
      setUser(null)
      userRef.current = null
      // Dispatch to Zustand store to keep global state in sync
      useAppStore.getState().dispatch({
        type: 'auth/setUser',
        payload: null,
      })
    } catch (err) {
      logger.error(err instanceof Error ? err : new Error(String(err)), { message: 'Logout failed' })
    } finally {
      setIsLoading(false)
    }
  }, [client, logger])

  const value = {
    user,
    currentUser: user, // Add alias
    // When password reset is required, don't consider user fully authenticated
    // This allows PasswordResetGate to show the flow while keeping auth-status as anonymous
    isAuthenticated: !!user && !user.passwordResetRequired,
    isLoading,
    status: isLoading ? 'loading' : user ? 'authenticated' : AUTH_STATUS_IDLE,
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
