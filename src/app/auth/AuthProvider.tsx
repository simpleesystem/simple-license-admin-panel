import type { LoginResponse, Client as SimpleLicenseClient, User } from '@simple-license/react-sdk'
import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApiClient } from '../../api/apiContext'
import {
  AUTH_STATUS_IDLE,
  AUTH_STATUS_LOADING,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../../app/constants'
import { AuthContext } from './authContext'
import { type PersistedAuth, persistAuth, persistAuthUser, readPersistedAuth, readPersistedUser } from './persistedAuth'
import type { AuthContextValue, AuthStatus } from './types'

const isBrowser = typeof window !== 'undefined'

const setTokenOnClient = (client: SimpleLicenseClient, token: string | null, expiresAt: number | null): void => {
  client.setToken(token, expiresAt)
}

export function AuthProvider({ children }: PropsWithChildren) {
  const client = useApiClient()
  const initialAuth = useMemo(() => readPersistedAuth(), [])
  const initialUser = useMemo(() => (initialAuth.token ? readPersistedUser() : null), [initialAuth.token])
  const [authState, setAuthState] = useState<PersistedAuth>(initialAuth)
  const { token, expiresAt } = authState
  const [status, setStatus] = useState<AuthStatus>(AUTH_STATUS_IDLE)
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)

  useEffect(() => {
    if (!initialAuth.token) {
      persistAuthUser(null)
    }
  }, [initialAuth.token])

  useEffect(() => {
    setTokenOnClient(client, token, expiresAt)
  }, [client, token, expiresAt])

  const resetAuthState = useCallback(() => {
    persistAuth(null, null)
    persistAuthUser(null)
    setAuthState({ token: null, expiresAt: null })
    setCurrentUser(null)
    setStatus(AUTH_STATUS_IDLE)
  }, [])

  const refreshCurrentUser = useCallback(async (): Promise<User | null> => {
    if (!token) {
      setCurrentUser(null)
      return null
    }

    try {
      setStatus(AUTH_STATUS_LOADING)
      const response = await client.getCurrentUser()
      setCurrentUser(response.user)
      persistAuthUser(response.user)
      setStatus(AUTH_STATUS_IDLE)
      return response.user
    } catch {
      setCurrentUser(null)
      persistAuthUser(null)
      setStatus(AUTH_STATUS_IDLE)
      return null
    }
  }, [client, token])

  useEffect(() => {
    if (!token || !isBrowser) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      void refreshCurrentUser()
    }, 0)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [token, refreshCurrentUser])

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResponse> => {
      setStatus(AUTH_STATUS_LOADING)
      try {
        const response = await client.login(username, password)
        const expiresAt = Date.now() + response.expires_in * 1_000
        persistAuth(response.token, expiresAt)
        persistAuthUser(response.user)
        setAuthState({ token: response.token, expiresAt })
        setCurrentUser(response.user)
        setStatus(AUTH_STATUS_IDLE)
        return response
      } catch (error) {
        resetAuthState()
        throw error
      }
    },
    [client, resetAuthState]
  )

  const logout = useCallback(() => {
    resetAuthState()
  }, [resetAuthState])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY_AUTH_TOKEN && event.newValue === null) {
        logout()
        return
      }
      if (event.key === STORAGE_KEY_AUTH_USER) {
        if (event.newValue) {
          try {
            const parsedUser = JSON.parse(event.newValue) as User
            setCurrentUser(parsedUser)
          } catch {
            setCurrentUser(null)
          }
        } else {
          setCurrentUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [logout])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      token,
      currentUser,
      status,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshCurrentUser,
    }),
    [token, currentUser, status, login, logout, refreshCurrentUser]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
