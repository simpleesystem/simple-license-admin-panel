import { createContext, useContext } from 'react'

import { ERROR_MESSAGE_AUTH_CONTEXT_UNAVAILABLE } from '../../app/constants'
import type { AuthContextValue } from './types'

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_AUTH_CONTEXT_UNAVAILABLE)
  }
  return context
}
