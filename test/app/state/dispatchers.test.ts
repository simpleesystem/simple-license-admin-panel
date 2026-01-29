import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import { APP_ERROR_CODE_UNEXPECTED, APP_ERROR_TYPE_SERVER, APP_ERROR_TYPE_UNEXPECTED } from '@/app/constants'
import { mapUnknownToAppError } from '@/app/errors/appErrors'
import { raiseError, raiseErrorFromUnknown } from '@/app/state/dispatchers'
import type { AppStore } from '@/app/state/store'

vi.mock('@/app/errors/appErrors', async () => {
  const actual = await vi.importActual<typeof import('@/app/errors/appErrors')>('@/app/errors/appErrors')
  return {
    ...actual,
    mapUnknownToAppError: vi.fn(),
  }
})

describe('dispatchers', () => {
  let mockDispatch: AppStore['dispatch']

  beforeEach(() => {
    mockDispatch = vi.fn()
  })

  describe('raiseError', () => {
    it('dispatches error/raise action and returns error', () => {
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }

      const result = raiseError(mockDispatch, error)

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'error/raise',
        payload: error,
      })
      expect(result).toEqual(error)
    })

    it('handles error without explicit scope', () => {
      const error = {
        type: APP_ERROR_TYPE_SERVER,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }

      const result = raiseError(mockDispatch, error)

      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'error/raise',
        payload: error,
      })
      expect(result).toEqual(error)
    })
  })

  describe('raiseErrorFromUnknown', () => {
    it('maps unknown error and dispatches error/raise action', () => {
      const unknownError = new Error(faker.lorem.sentence())
      const scope = 'data' as const
      const mappedError = {
        type: APP_ERROR_TYPE_UNEXPECTED,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope,
      }

      vi.mocked(mapUnknownToAppError).mockReturnValue(mappedError)

      const result = raiseErrorFromUnknown({
        error: unknownError,
        dispatch: mockDispatch,
        scope,
      })

      expect(mapUnknownToAppError).toHaveBeenCalledWith(unknownError, scope)
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'error/raise',
        payload: mappedError,
      })
      expect(result).toEqual(mappedError)
    })

    it('uses global scope when scope is not provided', () => {
      const unknownError = new Error(faker.lorem.sentence())
      const mappedError = {
        type: APP_ERROR_TYPE_UNEXPECTED,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }

      vi.mocked(mapUnknownToAppError).mockReturnValue(mappedError)

      const result = raiseErrorFromUnknown({
        error: unknownError,
        dispatch: mockDispatch,
      })

      expect(mapUnknownToAppError).toHaveBeenCalledWith(unknownError, 'global')
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'error/raise',
        payload: mappedError,
      })
      expect(result).toEqual(mappedError)
    })

    it('handles non-Error throwables', () => {
      const unknownError = faker.lorem.sentence()
      const scope = 'data' as const
      const mappedError = {
        type: APP_ERROR_TYPE_UNEXPECTED,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope,
      }

      vi.mocked(mapUnknownToAppError).mockReturnValue(mappedError)

      const result = raiseErrorFromUnknown({
        error: unknownError,
        dispatch: mockDispatch,
        scope,
      })

      expect(mapUnknownToAppError).toHaveBeenCalledWith(unknownError, scope)
      expect(result).toEqual(mappedError)
    })

    it('handles null error', () => {
      const mappedError = {
        type: APP_ERROR_TYPE_UNEXPECTED,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'global' as const,
      }

      vi.mocked(mapUnknownToAppError).mockReturnValue(mappedError)

      const result = raiseErrorFromUnknown({
        error: null,
        dispatch: mockDispatch,
      })

      expect(mapUnknownToAppError).toHaveBeenCalledWith(null, 'global')
      expect(result).toEqual(mappedError)
    })

    it('handles undefined error', () => {
      const mappedError = {
        type: APP_ERROR_TYPE_UNEXPECTED,
        code: APP_ERROR_CODE_UNEXPECTED,
        message: faker.lorem.sentence(),
        scope: 'data' as const,
      }

      vi.mocked(mapUnknownToAppError).mockReturnValue(mappedError)

      const result = raiseErrorFromUnknown({
        error: undefined,
        dispatch: mockDispatch,
        scope: 'data',
      })

      expect(mapUnknownToAppError).toHaveBeenCalledWith(undefined, 'data')
      expect(result).toEqual(mappedError)
    })
  })
})
