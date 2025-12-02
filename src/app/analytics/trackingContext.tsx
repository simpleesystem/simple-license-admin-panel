import { createContext, useContext } from 'react'

import { ERROR_MESSAGE_TRACKING_CONTEXT_UNAVAILABLE } from '../../app/constants'
import type { TrackingClient } from './tracking'

export const TrackingContext = createContext<TrackingClient | null>(null)

export const useTracking = (): TrackingClient => {
  const context = useContext(TrackingContext)
  if (!context) {
    throw new Error(ERROR_MESSAGE_TRACKING_CONTEXT_UNAVAILABLE)
  }
  return context
}


