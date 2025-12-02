import { createContext, useContext } from 'react'

import { ERROR_MESSAGE_LOGGER_CONTEXT_UNAVAILABLE } from '../../app/constants'
import type { Logger } from './logger'

export const LoggerContext = createContext<Logger | null>(null)

export const useLogger = (): Logger => {
  const context = useContext(LoggerContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_LOGGER_CONTEXT_UNAVAILABLE)
  }
  return context
}


