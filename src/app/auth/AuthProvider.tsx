import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useApiClient } from '@/api/apiContext'
import { useLogger } from '@/app/logging/loggerContext'
import { clearPersistedQueryCache } from '@/app/query/persistence'
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
import { safeRemoveItem } from '../state/safeStorage'
import { useAppStore } from '../state/store'
import { AuthContext } from './authContext'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const client = useApiClient()
  const logger = useLogger()
  const queryClient = useQueryClient()
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoadingState] = useState(true)
  const [error, setErrorState] = useState<string | null>(null)

  // Use a ref to track if we've already attempted initialization
  // This helps prevents double-fetching in StrictMode
  const initialized = useRef(false)
  // Use a ref to track current user for fetchUser callback
  const userRef = useRef<User | null>(null)

  // The async flows below (initSession, login, logout, fetchUser) resolve
  // after awaits; if the provider unmounted in the meantime (fast nav, test
  // teardown), bare setState would fire against an unmounted component.
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const setUser = useCallback((next: User | null) => {
    if (isMountedRef.current) {
      setUserState(next)
    }
  }, [])
  const setIsLoading = useCallback((next: boolean) => {
    if (isMountedRef.current) {
      setIsLoadingState(next)
    }
  }, [])
  const setError = useCallback((next: string | null) => {
    if (isMountedRef.current) {
      setErrorState(next)
    }
  }, [])

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
    [client, logger, setUser]
  )

  const initSession = useCallback(async () => {
    if (initialized.current) {
      return
    }
    initialized.current = true

    setIsLoading(true)
    setError(null)

    // One-time purge of the REMOVED legacy localStorage auth path. Older
    // builds persisted the access token/expiry/user under these keys; the app
    // no longer reads or writes them (auth is in-memory token + HttpOnly
    // refresh cookie only), but residual tokens from old sessions must not be
    // left sitting in storage. Storage access is best-effort: it can throw in
    // Safari private mode and sandboxed iframes, and that must never break
    // session initialization.
    safeRemoveItem(STORAGE_KEY_AUTH_TOKEN)
    safeRemoveItem(STORAGE_KEY_AUTH_EXPIRY)
    safeRemoveItem(STORAGE_KEY_AUTH_USER)

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
  }, [client, fetchUser, logger, setError, setIsLoading, setUser])

  useEffect(() => {
    initSession()
  }, [initSession])

  // NOTE: the former cross-tab `storage` event listener was removed with the
  // legacy localStorage auth path. Nothing writes auth state to localStorage
  // anymore, so the token-removal branch could never fire — and the user-sync
  // branch let any writer of the legacy key inject a user object into app
  // state. Session identity now comes exclusively from the server (HttpOnly
  // refresh cookie -> /auth/refresh -> in-memory access token -> /users/me).

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await client.login(credentials.username, credentials.password)
        const mustChangePassword = response.must_change_password ?? response.mustChangePassword ?? false
        const hasLoginUser =
          typeof response.user === 'object' &&
          response.user !== null &&
          typeof response.user.id === 'string' &&
          response.user.id.trim().length > 0

        if (hasLoginUser) {
          const userWithResetFlag: User = {
            ...response.user,
            passwordResetRequired: mustChangePassword || response.user.passwordResetRequired || false,
          }
          setUser(userWithResetFlag)
          userRef.current = userWithResetFlag
          useAppStore.getState().dispatch({
            type: 'auth/setUser',
            payload: userWithResetFlag,
          })
        }

        // Always attempt to hydrate the authoritative user profile after login.
        // Some deployments may return token-first login payloads where user is omitted.
        if (!mustChangePassword) {
          await fetchUser(hasLoginUser)
        }

        if (!userRef.current) {
          throw new Error('Login succeeded but user profile could not be loaded')
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
    [client, fetchUser, logger, setError, setIsLoading, setUser]
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
      // Drop all cached admin data (in-memory + persisted) so the next session
      // on a shared machine cannot briefly see the previous user's data.
      queryClient.clear()
      clearPersistedQueryCache()
    } catch (err) {
      logger.error(err instanceof Error ? err : new Error(String(err)), { message: 'Logout failed' })
    } finally {
      setIsLoading(false)
    }
  }, [client, logger, queryClient, setIsLoading, setUser])

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
