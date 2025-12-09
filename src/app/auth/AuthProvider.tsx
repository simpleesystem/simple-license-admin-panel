import type { LoginResponse, Client as SimpleLicenseClient, User } from '@simple-license/react-sdk'
import {
  ApiException,
  ERROR_CODE_INVALID_TOKEN,
  ERROR_CODE_MISSING_TOKEN,
  ERROR_CODE_MUST_CHANGE_PASSWORD,
  HTTP_FORBIDDEN,
  HTTP_UNAUTHORIZED,
} from '@simple-license/react-sdk'
import type { PropsWithChildren } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApiClient } from '../../api/apiContext'
import {
  AUTH_STATUS_IDLE,
  AUTH_STATUS_LOADING,
  AUTH_TOKEN_EXPIRY_SKEW_MS,
  STORAGE_KEY_AUTH_TOKEN,
  STORAGE_KEY_AUTH_USER,
} from '../../app/constants'
import { createLifecycle } from '../lifecycle/lifecycle'
import { useLogger } from '../logging/loggerContext'
import { raiseErrorFromUnknown } from '../state/dispatchers'
import { useAppStore } from '../state/store'
import { AuthContext } from './authContext'
import { type PersistedAuth, persistAuth, persistAuthUser, readPersistedAuth, readPersistedUser } from './persistedAuth'
import type { AuthContextValue, AuthStatus } from './types'

const isBrowser = typeof window !== 'undefined'

const setTokenOnClient = (client: SimpleLicenseClient, token: string | null, expiresAt: number | null): void => {
  client.setToken(token, expiresAt)
}

const isTokenInvalid = (error: ApiException): boolean => {
  const status = error.errorDetails?.status
  const code = error.errorCode
  return status === HTTP_UNAUTHORIZED || code === ERROR_CODE_INVALID_TOKEN || code === ERROR_CODE_MISSING_TOKEN
}

const normalizeExpiry = (expiresInSeconds: number | null | undefined): number | null => {
  if (!Number.isFinite(expiresInSeconds) || (expiresInSeconds ?? 0) <= 0) {
    return null
  }
  const expiresAtRaw = Date.now() + (expiresInSeconds as number) * 1000
  const adjusted = expiresAtRaw - AUTH_TOKEN_EXPIRY_SKEW_MS
  return adjusted > Date.now() ? adjusted : expiresAtRaw
}

export function AuthProvider({ children }: PropsWithChildren) {
  const client = useApiClient()
  const initialAuth = useMemo(() => readPersistedAuth(), [])
  const initialUser = useMemo(() => (initialAuth.token ? readPersistedUser() : null), [initialAuth.token])
  const [authState, setAuthState] = useState<PersistedAuth>(initialAuth)
  const { token, expiresAt } = authState
  const [status, setStatus] = useState<AuthStatus>(AUTH_STATUS_IDLE)
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser)
  const dispatch = useAppStore((state) => state.dispatch)
  const logger = useLogger()
  const isRefreshingRef = useRef(false)
  const lifecycleRef = useRef(createLifecycle())

  useEffect(() => {
    if (!initialAuth.token) {
      persistAuthUser(null)
      dispatch({ type: 'auth/setUser', payload: null })
      logger.debug('auth:initialize:missing-token')
    }
  }, [initialAuth.token, dispatch, logger])

  useEffect(() => {
    setTokenOnClient(client, token, expiresAt)
    dispatch({ type: 'auth/setUser', payload: currentUser })
    logger.debug('auth:set-token', { hasToken: Boolean(token), expiresAt, hasUser: Boolean(currentUser) })
  }, [client, token, expiresAt, currentUser, dispatch, logger])

  const resetAuthState = useCallback(() => {
    persistAuth(null, null)
    persistAuthUser(null)
    setAuthState({ token: null, expiresAt: null })
    setCurrentUser(null)
    setStatus(AUTH_STATUS_IDLE)
    lifecycleRef.current.dispose()
  }, [])

  const refreshCurrentUser = useCallback(async (): Promise<User | null> => {
    if (!token) {
      setCurrentUser(null)
      persistAuthUser(null)
      dispatch({ type: 'auth/setUser', payload: null })
      return null
    }

    dispatch({ type: 'loading/set', scope: 'auth', isLoading: true })

    if (expiresAt !== null && expiresAt <= Date.now()) {
      logger.warn('auth:refresh:token-expired')
      resetAuthState()
      dispatch({ type: 'auth/setUser', payload: null })
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: false })
      return null
    }

    if (isRefreshingRef.current) {
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: false })
      return currentUser
    }
    isRefreshingRef.current = true

    try {
      setStatus(AUTH_STATUS_LOADING)
      logger.debug('auth:refresh:start')
      const response = await client.getCurrentUser()
      if (!response?.user) {
        logger.warn('auth:refresh:no-user-payload', { hasCurrentUser: Boolean(currentUser) })
        if (currentUser) {
          setStatus(AUTH_STATUS_IDLE)
          return currentUser
        }
        resetAuthState()
        dispatch({ type: 'auth/setUser', payload: null })
        return null
      }
      setCurrentUser(response.user)
      persistAuthUser(response.user)
      dispatch({ type: 'auth/setUser', payload: response.user })
      setStatus(AUTH_STATUS_IDLE)
      logger.debug('auth:refresh:success', {
        userId: response.user.id,
        passwordResetRequired: response.user.passwordResetRequired,
      })
      return response.user
    } catch (error) {
      if (error instanceof ApiException) {
        const message = (error.message || '').toLowerCase()
        const isPasswordResetError =
          error.errorDetails?.code === ERROR_CODE_MUST_CHANGE_PASSWORD ||
          error.errorDetails?.status === HTTP_FORBIDDEN ||
          message.includes('password change required')

        if (isPasswordResetError) {
          const updatedUser: User =
            currentUser !== null
              ? { ...currentUser, passwordResetRequired: true }
              : {
                  id: '',
                  username: '',
                  email: '',
                  passwordResetRequired: true,
                }
          setCurrentUser(updatedUser)
          persistAuthUser(updatedUser)
          dispatch({ type: 'auth/setUser', payload: updatedUser })
          setStatus(AUTH_STATUS_IDLE)
          logger.warn('auth:refresh:password-reset-required', {
            status: error.errorDetails?.status,
            code: error.errorCode,
            requestId: error.errorDetails?.requestId,
          })
          return updatedUser
        }
        if (isTokenInvalid(error)) {
          logger.warn('auth:refresh:invalid-token', {
            status: error.errorDetails?.status,
            code: error.errorCode,
            requestId: error.errorDetails?.requestId,
          })
          resetAuthState()
          dispatch({ type: 'auth/setUser', payload: null })
          setStatus(AUTH_STATUS_IDLE)
          return null
        }

        setStatus(AUTH_STATUS_IDLE)
        const appError = raiseErrorFromUnknown({
          error,
          dispatch,
          scope: 'auth',
        })
        logger.error(error, {
          stage: 'auth:refresh:error',
          code: appError.code,
          type: appError.type,
          status: appError.status,
          requestId: appError.requestId,
          scope: appError.scope,
        })
        return currentUser
      }
      // Non-API errors: do not drop user; just return idle
      setStatus(AUTH_STATUS_IDLE)
      logger.error(error, { stage: 'auth:refresh:unknown' })
      return currentUser
    } finally {
      isRefreshingRef.current = false
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: false })
    }
  }, [client, token, expiresAt, currentUser, dispatch, logger, resetAuthState])

  useEffect(() => {
    if (!token || !isBrowser || currentUser?.passwordResetRequired) {
      return
    }
    if (expiresAt !== null && expiresAt <= Date.now()) {
      logger.warn('auth:init:token-expired')
      resetAuthState()
      dispatch({ type: 'auth/setUser', payload: null })
      return
    }

    lifecycleRef.current.dispose()
    lifecycleRef.current = createLifecycle()

    const timeoutId = window.setTimeout(() => {
      void refreshCurrentUser()
    }, 0)
    lifecycleRef.current.addCleanup(() => window.clearTimeout(timeoutId))

    return () => {
      lifecycleRef.current.dispose()
    }
  }, [token, expiresAt, refreshCurrentUser, currentUser?.passwordResetRequired, logger, resetAuthState, dispatch])

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResponse> => {
      setStatus(AUTH_STATUS_LOADING)
      dispatch({ type: 'loading/set', scope: 'auth', isLoading: true })
      logger.debug('auth:login:start')
      try {
        const response = await client.login(username, password)
        const expiresInSeconds =
          (response as { expiresIn?: number; expires_in?: number }).expiresIn ??
          (response as { expires_in?: number }).expires_in
        const expiresAt = normalizeExpiry(expiresInSeconds)
        const passwordResetRequired =
          (response as { mustChangePassword?: boolean }).mustChangePassword ??
          (response as { must_change_password?: boolean }).must_change_password ??
          response.user?.passwordResetRequired ??
          false
        const normalizedUser = response.user ? { ...response.user, passwordResetRequired } : null
        persistAuth(response.token, expiresAt)
        persistAuthUser(normalizedUser)
        setAuthState({ token: response.token, expiresAt })
        setCurrentUser(normalizedUser)
        setStatus(AUTH_STATUS_IDLE)
        dispatch({ type: 'auth/setUser', payload: normalizedUser })
        logger.info('auth:login:success', {
          expiresAt,
          passwordResetRequired,
          userId: normalizedUser?.id ?? 'unknown',
        })
        return response
      } catch (error) {
        resetAuthState()
        const appError = raiseErrorFromUnknown({
          error,
          dispatch,
          scope: 'auth',
        })
        logger.error(error, {
          stage: 'auth:login:error',
          code: appError.code,
          type: appError.type,
          status: appError.status,
          requestId: appError.requestId,
          scope: appError.scope,
        })
        throw error
      } finally {
        dispatch({ type: 'loading/set', scope: 'auth', isLoading: false })
      }
    },
    [client, resetAuthState, dispatch, logger]
  )

  const logout = useCallback(() => {
    resetAuthState()
    dispatch({ type: 'auth/setUser', payload: null })
    logger.info('auth:logout')
  }, [resetAuthState, dispatch, logger])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    lifecycleRef.current.dispose()
    lifecycleRef.current = createLifecycle()

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
    lifecycleRef.current.addCleanup(() => window.removeEventListener('storage', handleStorage))

    return () => {
      lifecycleRef.current.dispose()
    }
  }, [logout])

  const contextValue = useMemo<AuthContextValue>(() => {
    const isAuthenticated = Boolean(token) && Boolean(currentUser) && !currentUser?.passwordResetRequired
    return {
      token,
      currentUser,
      status,
      isAuthenticated,
      login,
      logout,
      refreshCurrentUser,
    }
  }, [token, currentUser, status, login, logout, refreshCurrentUser])

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}
