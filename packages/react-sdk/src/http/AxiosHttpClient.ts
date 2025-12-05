/**
 * Axios-based HTTP Client implementation
 */
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import {
  CONTENT_TYPE_JSON,
  DEFAULT_TIMEOUT_SECONDS,
  HEADER_AUTHORIZATION,
  HEADER_BEARER_PREFIX,
  HEADER_CONTENT_TYPE,
} from '../constants'
import { NetworkException } from '../exceptions/ApiException'
import type { ErrorDetails } from '../types/api'
import type { HttpClientInterface, HttpData, HttpRequestConfig, HttpResponse } from './HttpClientInterface'

export class AxiosHttpClient implements HttpClientInterface {
  private readonly axiosInstance: AxiosInstance
  private authToken: string | null = null

  constructor(baseURL: string, timeoutSeconds: number = DEFAULT_TIMEOUT_SECONDS) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: timeoutSeconds * 1000,
      headers: {
        [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken && config.headers) {
          config.headers[HEADER_AUTHORIZATION] = `${HEADER_BEARER_PREFIX}${this.authToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.transformError(error))
      }
    )
  }

  private transformError(error: AxiosError): NetworkException {
    if (error.response) {
      const message =
        typeof error.response.data === 'object' &&
        error.response.data !== null &&
        'error' in error.response.data &&
        typeof error.response.data.error === 'object' &&
        error.response.data.error !== null &&
        'message' in error.response.data.error &&
        typeof error.response.data.error.message === 'string'
          ? error.response.data.error.message
          : error.message || 'Request failed'

      const errorDetails: ErrorDetails = {
        status: error.response.status,
        statusText: String(error.response.statusText),
      }
      return new NetworkException(message, errorDetails)
    }

    if (error.request) {
      const errorDetails: ErrorDetails | undefined = error.code ? { code: error.code } : undefined
      return new NetworkException(error.message || 'Network error - no response received', errorDetails, error)
    }

    return new NetworkException(error.message || 'Unknown network error', undefined, error)
  }

  setAuthToken(token: string | null): void {
    this.authToken = token
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  async get<T = Record<string, never>>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig | undefined = config
        ? {
            ...config,
            headers: {
              ...(this.axiosInstance.defaults.headers?.common || {}),
              ...config.headers,
            },
          }
        : undefined
      const response = await this.axiosInstance.get<T>(url, axiosConfig)
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(
          response.headers as Record<string, string | number | string[] | number[] | boolean | null | undefined>
        ),
      }
    } catch (error) {
      throw this.transformError(error as AxiosError)
    }
  }

  async post<T = Record<string, never>>(
    url: string,
    data?: HttpData,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig | undefined = config
        ? {
            ...config,
            headers: {
              ...(this.axiosInstance.defaults.headers?.common || {}),
              ...config.headers,
            },
          }
        : undefined
      const response = await this.axiosInstance.post<T>(url, data, axiosConfig)
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(
          response.headers as Record<string, string | number | string[] | number[] | boolean | null | undefined>
        ),
      }
    } catch (error) {
      throw this.transformError(error as AxiosError)
    }
  }

  async put<T = Record<string, never>>(
    url: string,
    data?: HttpData,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig | undefined = config
        ? {
            ...config,
            headers: {
              ...(this.axiosInstance.defaults.headers?.common || {}),
              ...config.headers,
            },
          }
        : undefined
      const response = await this.axiosInstance.put<T>(url, data, axiosConfig)
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(
          response.headers as Record<string, string | number | string[] | number[] | boolean | null | undefined>
        ),
      }
    } catch (error) {
      throw this.transformError(error as AxiosError)
    }
  }

  async patch<T = Record<string, never>>(
    url: string,
    data?: HttpData,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig | undefined = config
        ? {
            ...config,
            headers: {
              ...(this.axiosInstance.defaults.headers?.common || {}),
              ...config.headers,
            },
          }
        : undefined
      const response = await this.axiosInstance.patch<T>(url, data, axiosConfig)
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(
          response.headers as Record<string, string | number | string[] | number[] | boolean | null | undefined>
        ),
      }
    } catch (error) {
      throw this.transformError(error as AxiosError)
    }
  }

  async delete<T = Record<string, never>>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const axiosConfig: AxiosRequestConfig | undefined = config
        ? {
            ...config,
            headers: {
              ...(this.axiosInstance.defaults.headers?.common || {}),
              ...config.headers,
            },
          }
        : undefined
      const response = await this.axiosInstance.delete<T>(url, axiosConfig)
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(
          response.headers as Record<string, string | number | string[] | number[] | boolean | null | undefined>
        ),
      }
    } catch (error) {
      throw this.transformError(error as AxiosError)
    }
  }

  private extractHeaders(headers: {
    [key: string]: string | number | string[] | number[] | boolean | null | undefined
  }): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(headers)) {
      if (value === null || value === undefined) {
        continue
      }
      if (typeof value === 'string') {
        result[key] = value
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        result[key] = value[0]
      } else if (typeof value === 'number') {
        result[key] = String(value)
      } else if (typeof value === 'boolean') {
        result[key] = String(value)
      }
    }
    return result
  }
}
