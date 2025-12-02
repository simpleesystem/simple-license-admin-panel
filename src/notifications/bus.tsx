import mitt from 'mitt'
import { useMemo } from 'react'
import type { PropsWithChildren } from 'react'

import { NotificationBusContext } from './busContext'
import type { NotificationEventMap } from './types'

export function NotificationBusProvider({ children }: PropsWithChildren): JSX.Element {
  const bus = useMemo(() => mitt<NotificationEventMap>(), [])

  return <NotificationBusContext.Provider value={bus}>{children}</NotificationBusContext.Provider>
}

