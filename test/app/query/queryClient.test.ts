import { describe, expect, it, vi, beforeEach } from 'vitest'

import { NOTIFICATION_VARIANT_ERROR } from '../../../src/app/constants'
import { notifyQueryError } from '../../../src/app/query/errorNotifier'
import { createAppQueryClient } from '../../../src/app/queryClient'

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
    client.getMutationCache().config.onError?.(testError as never, undefined, undefined, {} as never, {} as never)

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

  it('handles query success and sets loading to false', () => {
    const client = createAppQueryClient()
    const queryCache = client.getQueryCache()
    const mockQuery = {
      meta: { scope: 'data' },
      queryKey: ['test'],
    }

    queryCache.config.onSuccess?.({}, mockQuery as never)

    expect(mocks.dispatchMock).toHaveBeenCalledWith({
      type: 'loading/set',
      scope: 'data',
      isLoading: false,
    })
  })

  it('handles query settled and sets loading to false', () => {
    const client = createAppQueryClient()
    const queryCache = client.getQueryCache()
    const mockQuery = {
      meta: { scope: 'data' },
      queryKey: ['test'],
    }

    queryCache.config.onSettled?.({}, null, mockQuery as never)

    expect(mocks.dispatchMock).toHaveBeenCalledWith({
      type: 'loading/set',
      scope: 'data',
      isLoading: false,
    })
  })

  it('handles mutation mutate and sets loading to true', () => {
    const client = createAppQueryClient()
    const mutationCache = client.getMutationCache()
    const mockContext = {
      meta: { scope: 'data' },
    }

    mutationCache.config.onMutate?.({}, {} as never, mockContext as never)

    expect(mocks.dispatchMock).toHaveBeenCalledWith({
      type: 'loading/set',
      scope: 'data',
      isLoading: true,
    })
  })

  it('handles mutation settled and sets loading to false', () => {
    const client = createAppQueryClient()
    const mutationCache = client.getMutationCache()
    const mockContext = {
      meta: { scope: 'data' },
    }

    mutationCache.config.onSettled?.({}, null, {}, mockContext as never)

    expect(mocks.dispatchMock).toHaveBeenCalledWith({
      type: 'loading/set',
      scope: 'data',
      isLoading: false,
    })
  })

  it('suppresses error toast when meta.suppressErrorToast is true', () => {
    const client = createAppQueryClient()
    const queryCache = client.getQueryCache()
    const testError = new Error('test error')
    const mockQuery = {
      meta: { scope: 'data', suppressErrorToast: true },
      queryKey: ['test'],
    }

    mocks.handleQueryErrorMock.mockReturnValue({
      titleKey: 'error',
      descriptionKey: 'description',
      variant: NOTIFICATION_VARIANT_ERROR,
    })

    queryCache.config.onError?.(testError as never, mockQuery as never)

    expect(mocks.handleQueryErrorMock).toHaveBeenCalled()
    expect(notifyQueryError).not.toHaveBeenCalled()
  })

  it('shows error toast when meta.suppressErrorToast is false', () => {
    const client = createAppQueryClient()
    const queryCache = client.getQueryCache()
    const testError = new Error('test error')
    const mockQuery = {
      meta: { scope: 'data', suppressErrorToast: false },
      queryKey: ['test'],
    }

    mocks.handleQueryErrorMock.mockReturnValue({
      titleKey: 'error',
      descriptionKey: 'description',
      variant: NOTIFICATION_VARIANT_ERROR,
    })

    queryCache.config.onError?.(testError as never, mockQuery as never)

    expect(mocks.handleQueryErrorMock).toHaveBeenCalled()
    expect(notifyQueryError).toHaveBeenCalled()
  })

  it('shows error toast when handleQueryError returns null', () => {
    const client = createAppQueryClient()
    const queryCache = client.getQueryCache()
    const testError = new Error('test error')
    const mockQuery = {
      meta: { scope: 'data' },
      queryKey: ['test'],
    }

    mocks.handleQueryErrorMock.mockReturnValue(null)

    queryCache.config.onError?.(testError as never, mockQuery as never)

    expect(notifyQueryError).not.toHaveBeenCalled()
  })
})
