import type { User } from '@/simpleLicense'
import { create } from 'zustand'
import { derivePermissionsFromUser } from '../auth/permissions'
import type { AppError } from '../errors/appErrors'
import type { ErrorScope } from './types'

const getLatestError = (surface: SurfaceState): AppError | null => {
  const { lastScope, errors } = surface
  if (lastScope && errors[lastScope]) {
    return errors[lastScope]
  }
  const scopes = Object.keys(errors)
  if (scopes.length === 0) {
    return null
  }
  return errors[scopes[scopes.length - 1] as ErrorScope] ?? null
}

export type NavigationIntent = {
  to: string
  replace?: boolean
}

export type Action =
  | { type: 'error/raise'; payload: AppError }
  | { type: 'error/clear'; scope?: ErrorScope }
  | { type: 'auth/setUser'; payload: User | null }
  | { type: 'data/patch'; payload: Record<string, unknown> }
  | { type: 'nav/intent'; payload: NavigationIntent | null }
  | { type: 'nav/clearIntent' }
  | { type: 'loading/set'; scope: ErrorScope; isLoading: boolean }

export type SurfaceState = {
  errors: Record<ErrorScope, AppError>
  lastScope: ErrorScope | null
  loading: Record<ErrorScope, boolean>
}

export type AppState = {
  user: User | null
  permissions: ReturnType<typeof derivePermissionsFromUser>
  data: Record<string, unknown>
  surface: SurfaceState
  navigationIntent: NavigationIntent | null
}

export type AppStore = AppState & {
  dispatch: (action: Action) => void
}

const initialState: AppState = {
  user: null,
  permissions: derivePermissionsFromUser(null),
  data: {},
  surface: { errors: {}, lastScope: null, loading: {} },
  navigationIntent: null,
}

export const useAppStore = create<AppStore>()((set) => ({
  ...initialState,
  dispatch: (action: Action) => {
    switch (action.type) {
      case 'error/raise':
        set((prev) => {
          const scope = action.payload.scope ?? ('global' as ErrorScope)
          const nextErrors = { ...prev.surface.errors, [scope]: { ...action.payload, scope } }
          return {
            surface: {
              errors: nextErrors,
              lastScope: scope,
              loading: prev.surface.loading,
            },
          }
        })
        return
      case 'error/clear':
        set((prev) => {
          if (action.scope) {
            const { [action.scope]: _removed, ...rest } = prev.surface.errors
            void _removed
            const lastScope = prev.surface.lastScope === action.scope ? null : prev.surface.lastScope
            return {
              surface: {
                errors: rest,
                lastScope,
                loading: prev.surface.loading,
              },
            }
          }
          return { surface: { errors: {}, lastScope: null, loading: {} } }
        })
        return
      case 'loading/set':
        set((prev) => ({
          surface: {
            ...prev.surface,
            loading: { ...prev.surface.loading, [action.scope]: action.isLoading },
          },
        }))
        return
      case 'auth/setUser': {
        const user = action.payload
        set({
          user,
          permissions: derivePermissionsFromUser(user),
        })
        return
      }
      case 'data/patch': {
        set((prev) => ({
          data: { ...prev.data, ...action.payload },
        }))
        return
      }
      case 'nav/intent': {
        set({
          navigationIntent: action.payload,
        })
        return
      }
      case 'nav/clearIntent': {
        set({
          navigationIntent: null,
        })
        return
      }
      default:
        return
    }
  },
}))

// Selectors
export const selectSurface = (state: AppStore) => state.surface
export const selectErrorSurface = (state: AppStore) => {
  return getLatestError(state.surface)
}
export const selectErrorByScope = (scope: ErrorScope) => (state: AppStore) => state.surface.errors[scope] ?? null
export const selectLatestError = (state: AppStore) => getLatestError(state.surface)
export const selectErrorViewModel = (scope?: ErrorScope) => (state: AppStore) => {
  const error = scope ? (state.surface.errors[scope] ?? null) : getLatestError(state.surface)
  if (!error) {
    return null
  }
  return {
    id: error.correlationId ?? error.requestId ?? error.code,
    code: error.code,
    message: error.message,
    type: error.type,
    status: error.status,
    scope: error.scope,
    requestId: error.requestId,
    correlationId: error.correlationId,
  }
}
export const selectLoadingByScope = (scope: ErrorScope) => (state: AppStore) => state.surface.loading[scope] ?? false
export const selectAnyLoading = (state: AppStore) =>
  Object.values(state.surface.loading).some((value) => Boolean(value))
export const selectUser = (state: AppStore) => state.user
export const selectPermissions = (state: AppStore) => state.permissions
export const selectNavigationIntent = (state: AppStore) => state.navigationIntent
export const selectData = (state: AppStore) => state.data
