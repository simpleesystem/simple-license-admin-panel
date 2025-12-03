import { describe, expect, it, vi } from 'vitest'

import { NOTIFICATION_VARIANT_ERROR } from '../../../src/app/constants'

const mocks = vi.hoisted(() => ({
  shouldRetryRequestMock: vi.fn(() => true),
  handleQueryErrorMock: vi.fn(() => ({
    titleKey: 'errors.query',
    descriptionKey: 'errors.description',
    variant: NOTIFICATION_VARIANT_ERROR,
  })),
}))

vi.mock('../../../src/app/query/errorHandling', () => ({
  shouldRetryRequest: mocks.shouldRetryRequestMock,
  handleQueryError: mocks.handleQueryErrorMock,
}))

import { createAppQueryClient } from '../../../src/app/queryClient'
import { QUERY_EVENT_ERROR, type QueryEventBus } from '../../../src/app/query/events'

describe('createAppQueryClient', () => {
  it('publishes query and mutation error events through the shared handler', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
    const queryEvents: QueryEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    }
    const client = createAppQueryClient(logger, queryEvents)
    const testError = new Error('query failed')

    client.getQueryCache().config.onError?.(testError as never, {} as never)
    client
      .getMutationCache()
      .config.onError?.(testError as never, undefined, undefined, {} as never, {} as never)

    expect(queryEvents.emit).toHaveBeenNthCalledWith(1, QUERY_EVENT_ERROR, { error: testError })
    expect(queryEvents.emit).toHaveBeenNthCalledWith(2, QUERY_EVENT_ERROR, { error: testError })
    expect(logger.error).toHaveBeenNthCalledWith(1, testError, { source: 'react-query' })
    expect(logger.error).toHaveBeenNthCalledWith(2, testError, { source: 'react-query' })
  })

  it('delegates retry decisions to the shared strategy', () => {
    const client = createAppQueryClient()
    const options = client.getDefaultOptions()
    const testError = new Error('transient')

    const queryRetryResult = options.queries?.retry?.(1, testError)
    const mutationRetryResult = options.mutations?.retry?.(2, testError)

    expect(mocks.shouldRetryRequestMock).toHaveBeenNthCalledWith(1, 1, testError)
    expect(mocks.shouldRetryRequestMock).toHaveBeenNthCalledWith(2, 2, testError)
    expect(queryRetryResult).toBe(true)
    expect(mutationRetryResult).toBe(true)
  })

  it('logs errors even when no query event bus is provided', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }

    const client = createAppQueryClient(logger)
    const error = new Error('orphaned')

    client.getQueryCache().config.onError?.(error as never, {} as never)

    expect(logger.error).toHaveBeenCalledWith(error, { source: 'react-query' })
  })
})


