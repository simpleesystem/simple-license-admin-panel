import { describe, expect, it } from 'vitest'
import {
  ApiException,
  ERROR_CODE_INVALID_CREDENTIALS,
  ERROR_CODE_NETWORK_ERROR,
  ERROR_CODE_VALIDATION_ERROR,
  HTTP_BAD_REQUEST,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_UNAUTHORIZED,
  NetworkException,
} from '@/simpleLicense'

import {
  APP_ERROR_CODE_UNEXPECTED,
  APP_ERROR_TYPE_AUTH,
  APP_ERROR_TYPE_NETWORK,
  APP_ERROR_TYPE_SERVER,
  APP_ERROR_TYPE_UNEXPECTED,
  APP_ERROR_TYPE_VALIDATION,
} from '../../../src/app/constants'
import { mapUnknownToAppError } from '../../../src/app/errors/appErrors'

describe('mapUnknownToAppError', () => {
  it('maps network exceptions to network errors', () => {
    const error = new NetworkException('Network down', { status: 0, code: ERROR_CODE_NETWORK_ERROR })
    const result = mapUnknownToAppError(error, 'data')

    expect(result.type).toBe(APP_ERROR_TYPE_NETWORK)
    expect(result.code).toBe(ERROR_CODE_NETWORK_ERROR)
    expect(result.status).toBe(0)
    expect(result.scope).toBe('data')
  })

  it('maps api authentication errors to auth type', () => {
    const error = new ApiException('Unauthorized', ERROR_CODE_INVALID_CREDENTIALS, {
      status: HTTP_UNAUTHORIZED,
      requestId: 'req-auth-1',
    })
    const result = mapUnknownToAppError(error, 'auth')

    expect(result.type).toBe(APP_ERROR_TYPE_AUTH)
    expect(result.code).toBe(ERROR_CODE_INVALID_CREDENTIALS)
    expect(result.requestId).toBe('req-auth-1')
    expect(result.scope).toBe('auth')
  })

  it('maps validation errors to validation type', () => {
    const error = new ApiException('Validation failed', ERROR_CODE_VALIDATION_ERROR, { status: HTTP_BAD_REQUEST })
    const result = mapUnknownToAppError(error, 'data')

    expect(result.type).toBe(APP_ERROR_TYPE_VALIDATION)
    expect(result.code).toBe(ERROR_CODE_VALIDATION_ERROR)
    expect(result.status).toBe(HTTP_BAD_REQUEST)
  })

  it('maps server errors to server type', () => {
    const error = new ApiException('Server exploded', 'SERVER_ERROR', { status: HTTP_INTERNAL_SERVER_ERROR })
    const result = mapUnknownToAppError(error, 'data')

    expect(result.type).toBe(APP_ERROR_TYPE_SERVER)
    expect(result.code).toBe('SERVER_ERROR')
    expect(result.status).toBe(HTTP_INTERNAL_SERVER_ERROR)
  })

  it('maps unexpected throwables to unexpected type', () => {
    const result = mapUnknownToAppError('boom', 'global')

    expect(result.type).toBe(APP_ERROR_TYPE_UNEXPECTED)
    expect(result.code).toBe(APP_ERROR_CODE_UNEXPECTED)
    expect(result.scope).toBe('global')
  })
})
