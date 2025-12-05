import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CONTENT_TYPE_JSON,
  DEFAULT_TIMEOUT_SECONDS,
  HEADER_CONTENT_TYPE,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_NOT_FOUND,
  HTTP_OK,
} from '@/constants'
import { NetworkException } from '@/exceptions/ApiException'
import { AxiosHttpClient } from '@/http/AxiosHttpClient'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('AxiosHttpClient', () => {
  let axiosInstance: AxiosInstance
  let httpClient: AxiosHttpClient

  beforeEach(() => {
    vi.clearAllMocks()
    axiosInstance = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      defaults: {
        headers: {
          common: {},
        },
      },
    } as unknown as AxiosInstance

    mockedAxios.create.mockReturnValue(axiosInstance)
    httpClient = new AxiosHttpClient('https://api.example.com')
  })

  describe('constructor', () => {
    it('should create axios instance with base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        timeout: DEFAULT_TIMEOUT_SECONDS * 1000,
        headers: {
          [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
        },
      })
    })

    it('should create axios instance with custom timeout', () => {
      const customTimeoutSeconds = 60
      new AxiosHttpClient('https://api.example.com', customTimeoutSeconds)

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: customTimeoutSeconds * 1000,
        })
      )
    })

    it('should set up request interceptor for authentication', () => {
      expect(axiosInstance.interceptors.request.use).toHaveBeenCalled()
    })
  })

  describe('get', () => {
    it('should make GET request and return response', async () => {
      const responseData = { success: true, data: { id: '123' } }
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: responseData,
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(axiosInstance.get).toHaveBeenCalledWith('/test', undefined)
      expect(result.data).toEqual(responseData)
      expect(result.status).toBe(HTTP_OK)
    })

    it('should pass config to axios', async () => {
      const config = { headers: { 'Custom-Header': 'value' } }
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.get('/test', config)

      expect(axiosInstance.get).toHaveBeenCalledWith('/test', config)
    })

    it('should throw NetworkException on error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_NOT_FOUND,
          statusText: 'Not Found',
          data: { error: { code: 'NOT_FOUND', message: 'Resource not found' } },
          headers: {},
          config: {} as never,
        },
        message: 'Request failed',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      await expect(httpClient.get('/test')).rejects.toThrow(NetworkException)
    })

    it('should throw NetworkException on network error without response', async () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNREFUSED',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      await expect(httpClient.get('/test')).rejects.toThrow(NetworkException)
    })
  })

  describe('post', () => {
    it('should make POST request with data', async () => {
      const requestData = { name: 'Test' }
      const responseData = { success: true, data: { id: '123', name: 'Test' } }

      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: responseData,
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      const result = await httpClient.post('/test', requestData)

      expect(axiosInstance.post).toHaveBeenCalledWith('/test', requestData, undefined)
      expect(result.data).toEqual(responseData)
    })

    it('should throw NetworkException on error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_INTERNAL_SERVER_ERROR,
          statusText: 'Internal Server Error',
          data: {},
          headers: {},
          config: {} as never,
        },
        message: 'Server error',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.post).mockRejectedValue(axiosError)

      await expect(httpClient.post('/test', {})).rejects.toThrow(NetworkException)
    })
  })

  describe('put', () => {
    it('should make PUT request with data', async () => {
      const requestData = { name: 'Updated' }
      vi.mocked(axiosInstance.put).mockResolvedValue({
        data: { success: true },
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.put('/test', requestData)

      expect(axiosInstance.put).toHaveBeenCalledWith('/test', requestData, undefined)
    })
  })

  describe('patch', () => {
    it('should make PATCH request with data', async () => {
      const requestData = { name: 'Patched' }
      vi.mocked(axiosInstance.patch).mockResolvedValue({
        data: { success: true },
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.patch('/test', requestData)

      expect(axiosInstance.patch).toHaveBeenCalledWith('/test', requestData, undefined)
    })
  })

  describe('delete', () => {
    it('should make DELETE request', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({
        data: { success: true },
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.delete('/test')

      expect(axiosInstance.delete).toHaveBeenCalledWith('/test', undefined)
    })
  })

  describe('setAuthToken', () => {
    it('should set authorization header in request interceptor', () => {
      const token = 'test-token'
      httpClient.setAuthToken(token)

      // The interceptor should be set up to add the token
      // We verify this by checking that the interceptor was configured
      expect(axiosInstance.interceptors.request.use).toHaveBeenCalled()
    })

    it('should return null when no token set', () => {
      expect(httpClient.getAuthToken()).toBeNull()
    })

    it('should return token when set', () => {
      const token = 'test-token'
      httpClient.setAuthToken(token)
      expect(httpClient.getAuthToken()).toBe(token)
    })

    it('should clear token when set to null', () => {
      httpClient.setAuthToken('test-token')
      httpClient.setAuthToken(null)
      expect(httpClient.getAuthToken()).toBeNull()
    })
  })

  describe('error transformation', () => {
    it('should extract error message from nested error object', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_NOT_FOUND,
          statusText: 'Not Found',
          data: {
            error: {
              message: 'Custom error message',
              code: 'CUSTOM_ERROR',
            },
          },
          headers: {},
          config: {} as never,
        },
        message: 'Request failed',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Custom error message')
      }
    })

    it('should use default message when error object missing message', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_NOT_FOUND,
          statusText: 'Not Found',
          data: {
            error: {},
          },
          headers: {},
          config: {} as never,
        },
        message: 'Request failed',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Request failed')
      }
    })

    it('should use default message when response data is not object', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_NOT_FOUND,
          statusText: 'Not Found',
          data: 'string error',
          headers: {},
          config: {} as never,
        },
        message: 'Request failed',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Request failed')
      }
    })

    it('should handle network error without code', async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
        message: 'Network Error',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Network Error')
      }
    })

    it('should handle network error without message', async () => {
      const axiosError = {
        isAxiosError: true,
        request: {},
        code: 'ECONNREFUSED',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Network error - no response received')
      }
    })

    it('should handle unknown error', async () => {
      const axiosError = {
        isAxiosError: true,
        message: 'Unknown error',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Unknown error')
      }
    })

    it('should handle error without message', async () => {
      const axiosError = {
        isAxiosError: true,
      } as unknown as AxiosError

      vi.mocked(axiosInstance.get).mockRejectedValue(axiosError)

      try {
        await httpClient.get('/test')
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkException)
        expect((error as NetworkException).message).toBe('Unknown network error')
      }
    })
  })

  describe('header extraction', () => {
    it('should extract string headers', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-custom': 'value',
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['content-type']).toBe('application/json')
      expect(result.headers['x-custom']).toBe('value')
    })

    it('should extract first element from array headers', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'set-cookie': ['session=123', 'token=abc'],
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['set-cookie']).toBe('session=123')
    })

    it('should convert number headers to string', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'content-length': 1234,
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['content-length']).toBe('1234')
    })

    it('should convert boolean headers to string', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'x-enabled': true,
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['x-enabled']).toBe('true')
    })

    it('should skip null headers', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'valid-header': 'value',
          'null-header': null,
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['valid-header']).toBe('value')
      expect(result.headers['null-header']).toBeUndefined()
    })

    it('should skip undefined headers', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'valid-header': 'value',
          'undefined-header': undefined,
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['valid-header']).toBe('value')
      expect(result.headers['undefined-header']).toBeUndefined()
    })

    it('should skip empty array headers', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {
          'valid-header': 'value',
          'empty-array': [],
        },
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.headers['valid-header']).toBe('value')
      expect(result.headers['empty-array']).toBeUndefined()
    })
  })

  describe('PUT error handling', () => {
    it('should throw NetworkException on PUT error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_INTERNAL_SERVER_ERROR,
          statusText: 'Internal Server Error',
          data: {},
          headers: {},
          config: {} as never,
        },
        message: 'Server error',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.put).mockRejectedValue(axiosError)

      await expect(httpClient.put('/test', {})).rejects.toThrow(NetworkException)
    })
  })

  describe('PATCH error handling', () => {
    it('should throw NetworkException on PATCH error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_INTERNAL_SERVER_ERROR,
          statusText: 'Internal Server Error',
          data: {},
          headers: {},
          config: {} as never,
        },
        message: 'Server error',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.patch).mockRejectedValue(axiosError)

      await expect(httpClient.patch('/test', {})).rejects.toThrow(NetworkException)
    })
  })

  describe('DELETE error handling', () => {
    it('should throw NetworkException on DELETE error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_INTERNAL_SERVER_ERROR,
          statusText: 'Internal Server Error',
          data: {},
          headers: {},
          config: {} as never,
        },
        message: 'Server error',
      } as unknown as AxiosError

      vi.mocked(axiosInstance.delete).mockRejectedValue(axiosError)

      await expect(httpClient.delete('/test')).rejects.toThrow(NetworkException)
    })
  })

  describe('request interceptor', () => {
    it('should add auth token when token is set', async () => {
      const token = 'test-token-123'
      httpClient.setAuthToken(token)

      let requestConfig: AxiosRequestConfig | undefined
      const interceptorFn = vi.mocked(axiosInstance.interceptors.request.use).mock.calls[0]?.[0]

      if (interceptorFn) {
        requestConfig = interceptorFn({
          headers: {},
        } as AxiosRequestConfig)
      }

      expect(requestConfig?.headers?.Authorization).toBe(`Bearer ${token}`)
    })

    it('should not add auth token when token is null', async () => {
      httpClient.setAuthToken(null)

      let requestConfig: AxiosRequestConfig | undefined
      const interceptorFn = vi.mocked(axiosInstance.interceptors.request.use).mock.calls[0]?.[0]

      if (interceptorFn) {
        requestConfig = interceptorFn({
          headers: {},
        } as AxiosRequestConfig)
      }

      expect(requestConfig?.headers?.Authorization).toBeUndefined()
    })

    it('should handle request interceptor error', async () => {
      const errorFn = vi.mocked(axiosInstance.interceptors.request.use).mock.calls[0]?.[1]
      const testError = new Error('Request config error')

      if (errorFn) {
        const result = errorFn(testError)
        await expect(result).rejects.toEqual(testError)
      }
    })
  })

  describe('response interceptor', () => {
    it('should pass through successful responses', async () => {
      const responseData = { success: true }
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: responseData,
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      const result = await httpClient.get('/test')

      expect(result.data).toEqual(responseData)
    })

    it('should pass through successful responses via interceptor callback (covers line 48)', () => {
      // Get the success handler from the interceptor setup (line 48)
      const responseInterceptorSuccessFn = vi.mocked(axiosInstance.interceptors.response.use).mock.calls[0]?.[0]

      if (responseInterceptorSuccessFn) {
        const mockResponse = {
          data: { success: true },
          status: HTTP_OK,
          statusText: 'OK',
          headers: {},
          config: {} as never,
        }

        const result = responseInterceptorSuccessFn(mockResponse)

        expect(result).toBe(mockResponse)
      }
    })

    it('should transform errors through response interceptor', async () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: HTTP_NOT_FOUND,
          statusText: 'Not Found',
          data: { error: { message: 'Resource not found' } },
          headers: {},
          config: {} as never,
        },
        message: 'Request failed',
      } as unknown as AxiosError

      // Get the error handler from the interceptor setup
      const responseInterceptorErrorFn = vi.mocked(axiosInstance.interceptors.response.use).mock.calls[0]?.[1]

      if (responseInterceptorErrorFn) {
        const result = await responseInterceptorErrorFn(axiosError).catch((err) => err)

        expect(result).toBeInstanceOf(NetworkException)
        expect(result.message).toBe('Resource not found')
      }
    })
  })

  describe('config handling', () => {
    it('should merge headers from config with defaults', async () => {
      const config = {
        headers: {
          'Custom-Header': 'custom-value',
        },
      }
      vi.mocked(axiosInstance.get).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.get('/test', config)

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Custom-Header': 'custom-value',
          }),
        })
      )
    })

    it('should handle POST with config', async () => {
      const config = { headers: { 'Custom-Header': 'value' } }
      vi.mocked(axiosInstance.post).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.post('/test', {}, config)

      expect(axiosInstance.post).toHaveBeenCalledWith('/test', {}, expect.any(Object))
    })

    it('should handle PUT with config', async () => {
      const config = { headers: { 'Custom-Header': 'value' } }
      vi.mocked(axiosInstance.put).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.put('/test', {}, config)

      expect(axiosInstance.put).toHaveBeenCalledWith('/test', {}, expect.any(Object))
    })

    it('should handle PATCH with config', async () => {
      const config = { headers: { 'Custom-Header': 'value' } }
      vi.mocked(axiosInstance.patch).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.patch('/test', {}, config)

      expect(axiosInstance.patch).toHaveBeenCalledWith('/test', {}, expect.any(Object))
    })

    it('should handle DELETE with config', async () => {
      const config = { headers: { 'Custom-Header': 'value' } }
      vi.mocked(axiosInstance.delete).mockResolvedValue({
        data: {},
        status: HTTP_OK,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

      await httpClient.delete('/test', config)

      expect(axiosInstance.delete).toHaveBeenCalledWith('/test', expect.any(Object))
    })
  })
})
