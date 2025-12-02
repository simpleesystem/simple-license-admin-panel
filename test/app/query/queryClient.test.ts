import { describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  notifyQueryErrorMock: vi.fn(),
  handleQueryErrorMock: vi.fn(() => ({
    titleKey: 'error.title',
    descriptionKey: 'error.description',
    variant: 'error',
  })),
  shouldRetryRequestMock: vi.fn(() => true),
}))

vi.mock('../../../src/app/query/errorNotifier', () => ({
  notifyQueryError: mocks.notifyQueryErrorMock,
}))

vi.mock('../../../src/app/query/errorHandling', () => ({
  handleQueryError: mocks.handleQueryErrorMock,
  shouldRetryRequest: mocks.shouldRetryRequestMock,
}))

import { createAppQueryClient } from '../../../src/app/queryClient'

describe('createAppQueryClient', () => {
  it('routes errors through the error notifier', () => {
    const logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }
    const client = createAppQueryClient(logger)
    const options = client.getDefaultOptions()
    const testError = new Error('query failed')

    options.queries?.onError?.(testError)

    expect(mocks.handleQueryErrorMock).toHaveBeenCalledWith(testError)
    expect(mocks.notifyQueryErrorMock).toHaveBeenCalledWith(mocks.handleQueryErrorMock.mock.results[0].value)
    expect(logger.error).toHaveBeenCalledWith(testError, { source: 'react-query' })
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


