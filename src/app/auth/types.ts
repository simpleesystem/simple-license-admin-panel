import type { User } from '@/simpleLicense'
import type { LoginCredentials } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  // Alias for user, for backward compatibility or clarity
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  status: string
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

