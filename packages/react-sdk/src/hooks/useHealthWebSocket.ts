import { useEffect, useMemo } from 'react'

import type { Client } from '../client'
import {
  WS_MESSAGE_TYPE_HEALTH_UPDATE,
  type HealthUpdateMessage,
  type HealthUpdatePayload,
} from '../types/websocket'
import { useWebSocket, type UseWebSocketOptions, type UseWebSocketResult } from './useWebSocket'

export type UseHealthWebSocketResult = UseWebSocketResult & {
  healthMessage?: HealthUpdateMessage | undefined
  healthData?: HealthUpdatePayload | undefined
}

export function useHealthWebSocket(client: Client, options?: UseWebSocketOptions): UseHealthWebSocketResult {
  const webSocketResult = useWebSocket(client, options)

  const healthMessage = useMemo(() => {
    if (webSocketResult.lastMessage?.type === WS_MESSAGE_TYPE_HEALTH_UPDATE) {
      return webSocketResult.lastMessage
    }
    return undefined
  }, [webSocketResult.lastMessage])

  useEffect(() => {
    if (webSocketResult.connected) {
      webSocketResult.requestHealth()
    }
  }, [webSocketResult])

  return {
    ...webSocketResult,
    healthMessage,
    healthData: healthMessage?.data,
  }
}

