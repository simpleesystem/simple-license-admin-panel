import type { LoginResponse, User } from '@simple-license/react-sdk'

import type { AUTH_STATUS_IDLE, AUTH_STATUS_LOADING } from '../../app/constants'

export type AuthStatus = typeof AUTH_STATUS_IDLE | typeof AUTH_STATUS_LOADING

export type AuthContextValue = {
  token: string | null
  currentUser: User | null
  status: AuthStatus
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<LoginResponse>
  logout: () => void
  refreshCurrentUser: () => Promise<User | null>
  setSession: (token: string, user: User) => void
}
