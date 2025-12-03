import { useEffect } from 'react'

import { NOTIFICATION_EVENT_TOAST } from '../constants'
import { useNotificationBus } from '../../notifications/busContext'
import { handleQueryError } from './errorHandling'
import type { QueryEventBus } from './events'
import { subscribeToQueryErrors } from './events'

type QueryErrorObserverProps = {
  queryEvents: QueryEventBus
}

export function QueryErrorObserver({ queryEvents }: QueryErrorObserverProps) {
  const notificationBus = useNotificationBus()

  useEffect(() => {
    return subscribeToQueryErrors(queryEvents, ({ error }) => {
      notificationBus.emit(NOTIFICATION_EVENT_TOAST, handleQueryError(error))
    })
  }, [notificationBus, queryEvents])

  return null
}




