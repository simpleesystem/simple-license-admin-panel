import mitt, { type Emitter } from 'mitt'

export const QUERY_EVENT_ERROR = 'query:error' as const

export type QueryErrorEvent = {
  error: unknown
}

export type QueryEventMap = {
  [QUERY_EVENT_ERROR]: QueryErrorEvent
}

export type QueryEventBus = Emitter<QueryEventMap>

export type QueryErrorHandler = (event: QueryErrorEvent) => void

export const createQueryEventBus = (): QueryEventBus => mitt<QueryEventMap>()

export const publishQueryError = (bus: QueryEventBus, error: unknown): void => {
  bus.emit(QUERY_EVENT_ERROR, { error })
}

export const subscribeToQueryErrors = (bus: QueryEventBus, handler: QueryErrorHandler): (() => void) => {
  bus.on(QUERY_EVENT_ERROR, handler)
  return () => {
    bus.off(QUERY_EVENT_ERROR, handler)
  }
}

