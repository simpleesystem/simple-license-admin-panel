import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import type { User } from '@/simpleLicense'
import { AuthContext } from '../../src/app/auth/authContext'

export const renderWithAuth = (ui: ReactElement, currentUser: User | null = null) => {
  const value = {
    currentUser,
    isAuthenticated: currentUser !== null,
    login: async () => {},
    logout: () => {},
  }

  return render(<AuthContext.Provider value={value}>{ui}</AuthContext.Provider>)
}
