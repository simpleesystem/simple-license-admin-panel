import { createContext, useContext } from 'react'
import type { Client as SimpleLicenseClient } from '@simple-license/react-sdk'

import { ERROR_MESSAGE_API_CONTEXT_UNAVAILABLE } from '../app/constants'

export const ApiContext = createContext<SimpleLicenseClient | null>(null)

export const useApiClient = (): SimpleLicenseClient => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_API_CONTEXT_UNAVAILABLE)
  }
  return context
}

