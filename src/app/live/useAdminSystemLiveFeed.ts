import { useContext } from 'react'
import { ADMIN_SYSTEM_WS_ERROR_CONTEXT_UNAVAILABLE } from '../constants'
import { type AdminSystemLiveContextValue, AdminSystemLiveFeedContext } from './AdminSystemLiveFeedContextDef'

export const useAdminSystemLiveFeed = (): AdminSystemLiveContextValue => {
  const context = useContext(AdminSystemLiveFeedContext)
  if (!context) {
    throw new Error(ADMIN_SYSTEM_WS_ERROR_CONTEXT_UNAVAILABLE)
  }
  return context
}
