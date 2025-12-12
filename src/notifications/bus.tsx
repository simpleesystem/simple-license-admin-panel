import mitt from 'mitt'
import type { JSX, PropsWithChildren } from 'react'
import { useMemo } from 'react'

import { NotificationBusContext } from './busContext'
import type { NotificationEventMap } from './types'

export function NotificationBusProvider({ children }: PropsWithChildren): JSX.Element {
  const bus = useMemo(() => {
    const instance = mitt<NotificationEventMap>()
    return instance
  }, [])

  return <NotificationBusContext.Provider value={bus}>{children}</NotificationBusContext.Provider>
}
