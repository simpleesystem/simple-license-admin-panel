import { describe, expect, it, vi, beforeEach } from 'vitest'

import { NOTIFICATION_VARIANT_ERROR } from '../../../src/app/constants'
import { createAppQueryClient } from '../../../src/app/queryClient'
import { notifyQueryError } from '../../../src/app/query/errorNotifier'
import { useAppStore } from '../../../src/app/state/store'

const mocks = vi.hoisted(() => ({
  shouldRetryRequestMock: vi.fn(() => true),
  handleQueryErrorMock: vi.fn(() => ({
    titleKey: 'errors.query',
    descriptionKey: 'errors.description',
    variant: NOTIFICATION_VARIANT_ERROR,
  })),
  dispatchMock: vi.fn(),
}))

vi.mock('../../../src/app/query/errorHandling', () => ({
  shouldRetryRequest: mocks.shouldRetryRequestMock,
  handleQueryError: mocks.handleQueryErrorMock,
}))

vi.mock('../../../src/app/query/errorNotifier', () => ({
  notifyQueryError: vi.fn(),
}))

vi.mock('../../../src/app/state/store', () => ({
  useAppStore: {
    getState: () => ({
      dispatch: mocks.dispatchMock,
    }),
  },
}))

describe('createAppQueryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishes query and mutation error events through the notification system', () => {
    const client = createAppQueryClient()
    const testError = new Error('query failed')

    client.getQueryCache().config.onError?.(testError as never, {} as never)
    client
      .getMutationCache()
      .config.onError?.(testError as never, undefined, undefined, {} as never, {} as never)

    expect(notifyQueryError).toHaveBeenCalledTimes(2)
    expect(mocks.dispatchMock).toHaveBeenCalledTimes(2)
    expect(mocks.dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error/raise',
      })
    )
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
})
