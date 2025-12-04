import { useCallback, useMemo } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'

type RequestHealthCapable = {
  requestHealth?: () => boolean
}

type UseLiveDataConfig<QueryData, SocketResult, Result> = {
  query: () => UseQueryResult<QueryData, Error>
  socket: () => SocketResult
  selectQueryData?: (data: QueryData | undefined) => Result | undefined
  selectSocketData?: (socketResult: SocketResult) => Result | undefined
  merge?: (input: {
    queryData?: Result
    liveData?: Result
    queryResult: UseQueryResult<QueryData, Error>
    socketResult: SocketResult
  }) => Result | undefined
}

export type UseLiveDataResult<QueryData, SocketResult, Result> = {
  data?: Result
  queryData?: Result
  liveData?: Result
  hasData: boolean
  isLoading: boolean
  isError: boolean
  queryResult: UseQueryResult<QueryData, Error>
  socketResult: SocketResult
  refresh: () => void
}

export function useLiveData<QueryData, SocketResult extends RequestHealthCapable, Result = QueryData>(
  config: UseLiveDataConfig<QueryData, SocketResult, Result>,
): UseLiveDataResult<QueryData, SocketResult, Result> {
  const queryResult = config.query()
  const socketResult = config.socket()

  const queryData = useMemo(() => {
    if (config.selectQueryData) {
      return config.selectQueryData(queryResult.data)
    }
    return queryResult.data as unknown as Result | undefined
  }, [config.selectQueryData, queryResult.data])

  const liveData = useMemo(() => {
    if (config.selectSocketData) {
      return config.selectSocketData(socketResult)
    }
    return undefined
  }, [config.selectSocketData, socketResult])

  const { merge } = config

  const data = useMemo(() => {
    if (merge) {
      return merge({ queryData, liveData, queryResult, socketResult })
    }
    if (liveData !== undefined && liveData !== null) {
      return liveData
    }
    return queryData
  }, [merge, queryData, liveData, queryResult, socketResult])

  const hasQueryData = queryData !== undefined && queryData !== null
  const hasLiveData = liveData !== undefined && liveData !== null
  const hasMergedData = data !== undefined && data !== null
  const hasData = hasMergedData || hasLiveData || hasQueryData

  const isLoading = queryResult.isLoading && !hasData
  const isError = queryResult.isError && !hasData

  const { refetch } = queryResult

  const refresh = useCallback(() => {
    void refetch()
    socketResult.requestHealth?.()
  }, [refetch, socketResult])

  return {
    data,
    queryData,
    liveData,
    hasData,
    isLoading,
    isError,
    queryResult,
    socketResult,
    refresh,
  }
}


