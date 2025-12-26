import type { ReactElement } from 'react'
import { render } from '@testing-library/react'

import { AuthContext } from '../../src/app/auth/authContext'
import type { User } from '@/simpleLicense'

export const renderWithAuth = (ui: ReactElement, currentUser: User | null = null) => {
  const value = {
    currentUser,
    isAuthenticated: currentUser !== null,
    login: async () => {},
    logout: () => {},
  }

  return render(<AuthContext.Provider value={value}>{ui}</AuthContext.Provider>)
}

