import { act, renderHook } from '@testing-library/react'
import type { UseQueryResult } from '@tanstack/react-query'
import { describe, expect, test, vi } from 'vitest'

import { useLiveData } from '../../src/hooks/useLiveData'

const createQueryResult = <TData,>(overrides?: Partial<UseQueryResult<TData, Error>>): UseQueryResult<TData, Error> =>
  ({
    data: overrides?.data,
    isLoading: overrides?.isLoading ?? false,
    isError: overrides?.isError ?? false,
    refetch: overrides?.refetch ?? vi.fn(),
  }) as UseQueryResult<TData, Error>

const createSocketResult = <TLive,>(overrides?: Partial<TLive> & { requestHealth?: () => boolean }) => ({
  requestHealth: vi.fn(),
  ...overrides,
})

describe('useLiveData', () => {
  test('prefers live data over query data', () => {
    const liveMetrics = { uptime: 10 }
    const queryMetrics = { uptime: 5 }
    const { result } = renderHook(() =>
      useLiveData({
        query: () => createQueryResult({ data: queryMetrics }),
        socket: () => createSocketResult({}),
        selectQueryData: (data) => data,
        selectSocketData: () => liveMetrics,
      }),
    )

    expect(result.current.data).toEqual(liveMetrics)
    expect(result.current.hasData).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  test('falls back to query data when live data missing', () => {
    const queryMetrics = { uptime: 5 }
    const { result } = renderHook(() =>
      useLiveData({
        query: () => createQueryResult({ data: queryMetrics, isLoading: false }),
        socket: () => createSocketResult({}),
        selectQueryData: (data) => data,
      }),
    )

    expect(result.current.data).toEqual(queryMetrics)
    expect(result.current.hasData).toBe(true)
  })

  test('reports loading when query is loading and no data present', () => {
    const { result } = renderHook(() =>
      useLiveData({
        query: () => createQueryResult({ data: undefined, isLoading: true }),
        socket: () => createSocketResult({}),
      }),
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.hasData).toBe(false)
  })

  test('refresh triggers both refetch and requestHealth', () => {
    const refetch = vi.fn()
    const requestHealth = vi.fn()
    const queryResult = createQueryResult({ data: undefined, refetch })
    const socketResult = createSocketResult({ requestHealth })

    const { result } = renderHook(() =>
      useLiveData({
        query: () => queryResult,
        socket: () => socketResult,
      }),
    )

    act(() => {
      result.current.refresh()
    })

    expect(refetch).toHaveBeenCalledTimes(1)
    expect(requestHealth).toHaveBeenCalledTimes(1)
  })
})


