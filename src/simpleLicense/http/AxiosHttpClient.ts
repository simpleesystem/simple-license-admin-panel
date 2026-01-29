/**
 * Axios-based HTTP Client implementation with tracing and bounded retries.
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  CONTENT_TYPE_JSON,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
  DEFAULT_TIMEOUT_SECONDS,
  ERROR_MESSAGE_CLIENT_CONFIGURATION,
  ERROR_MESSAGE_NETWORK_NO_RESPONSE,
  ERROR_MESSAGE_NO_RESPONSE,
  ERROR_MESSAGE_REQUEST_FAILED,
  HEADER_ACCEPT,
  HEADER_AUTHORIZATION,
  HEADER_BEARER_PREFIX,
  HEADER_CONTENT_TYPE,
  HEADER_CORRELATION_ID,
  HEADER_REQUEST_ID,
} from '../constants'
import { ApiException, ClientConfigurationException, NetworkException } from '../exceptions/ApiException'
import type { ErrorDetails } from '../types/api'
import { camelizeKeysDeep } from '../utils/case'
import type { HttpClientInterface, HttpData, HttpRequestConfig, HttpResponse } from './HttpClientInterface'
import { extractHeaderString, getHeaderString, normalizeTelemetry } from './telemetry'

const DEFAULT_METHOD = 'GET'

type AxiosRequestConfigWithMeta = AxiosRequestConfig & {
  metadata?: {
    start: number
    requestId: string
    durationMs?: number
  }
}

type HttpClientTelemetryHook = (payload: {
  method: string
  url?: string
  status?: number
  durationMs?: number
  requestId?: string
  correlationId?: string
  error?: unknown
  attempt?: number
}) => void

type HttpClientOptions = {
  retryAttempts?: number
  retryDelayMs?: number
  includeTraceHeaders?: boolean
  correlationId?: string
  onResponse?: HttpClientTelemetryHook
  onError?: HttpClientTelemetryHook
  onRefreshToken?: () => Promise<string | null>
}

export class AxiosHttpClient implements HttpClientInterface {
  private readonly axiosInstance: AxiosInstance
  private authToken: string | null = null
  private readonly retryAttempts: number
  private readonly retryDelayMs: number
  private readonly includeTraceHeaders: boolean
  private readonly baseCorrelationId?: string
  private readonly onResponse?: HttpClientTelemetryHook
  private readonly onError?: HttpClientTelemetryHook
  private readonly onRefreshToken?: () => Promise<string | null>
  private isRefreshing = false
  private failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

  constructor(baseURL: string, timeoutSeconds: number = DEFAULT_TIMEOUT_SECONDS, options?: HttpClientOptions) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: timeoutSeconds * 1000,
      withCredentials: true,
      headers: {
        [HEADER_CONTENT_TYPE]: CONTENT_TYPE_JSON,
        [HEADER_ACCEPT]: CONTENT_TYPE_JSON,
      },
    })

    this.retryAttempts = options?.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS
    this.retryDelayMs = options?.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
    this.includeTraceHeaders = options?.includeTraceHeaders ?? true
    this.baseCorrelationId = options?.correlationId
    this.onResponse = options?.onResponse
    this.onError = options?.onError
    this.onRefreshToken = options?.onRefreshToken

    this.setupInterceptors()
  }

  private processQueue(error: unknown, token: string | null = null): void {
    for (const prom of this.failedQueue) {
      if (error) {
        prom.reject(error)
      } else if (token) {
        prom.resolve(token)
      }
    }
    this.failedQueue = []
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => this.enrichRequestConfig(config) as InternalAxiosRequestConfig,
      (error) => Promise.reject(error)
    )

    this.axiosInstance.interceptors.response.use(
      (response) => {
        const config = response.config as AxiosRequestConfigWithMeta
        if (config?.metadata) {
          config.metadata.durationMs = Date.now() - config.metadata.start
        }
        response.data = camelizeKeysDeep(response.data)
        const telemetry = normalizeTelemetry({
          method: (response.config.method || DEFAULT_METHOD).toUpperCase(),
          url: response.config.url,
          status: response.status,
          durationMs: config?.metadata?.durationMs,
          requestId:
            config?.metadata?.requestId ??
            getHeaderString(response.headers as Record<string, unknown>, HEADER_REQUEST_ID),
          correlationId: extractHeaderString(response.config.headers?.[HEADER_CORRELATION_ID]),
        })
        this.onResponse?.(telemetry)
        return response
      },
      (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfigWithMeta & { _retry?: boolean }

        // Handle 401 Unauthorized with Refresh Token logic
        if (error.response?.status === 401 && !originalRequest._retry && this.onRefreshToken) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {}
                originalRequest.headers[HEADER_AUTHORIZATION] = `${HEADER_BEARER_PREFIX}${token}`
                return this.axiosInstance(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          return new Promise((resolve, reject) => {
            // biome-ignore lint/style/noNonNullAssertion: Checked in if condition
            this.onRefreshToken!()
              .then((token) => {
                if (token) {
                  this.setAuthToken(token)
                  originalRequest.headers = originalRequest.headers || {}
                  originalRequest.headers[HEADER_AUTHORIZATION] = `${HEADER_BEARER_PREFIX}${token}`
                  this.processQueue(null, token)
                  resolve(this.axiosInstance(originalRequest))
                } else {
                  this.processQueue(new Error('Token refresh failed'))
                  reject(this.transformError(error))
                }
              })
              .catch((err) => {
                this.processQueue(err)
                reject(this.transformError(error))
              })
              .finally(() => {
                this.isRefreshing = false
              })
          })
        }

        return Promise.reject(this.transformError(error))
      }
    )
  }

  private transformError(error: AxiosError): ApiException {
    const durationMs = this.getDuration(error)
    const requestIdFromHeaders = getHeaderString(
      error.response?.headers as Record<string, unknown> | undefined,
      HEADER_REQUEST_ID
    )

    if (error.response) {
      const camelizedData = camelizeKeysDeep(error.response.data)
      const responseError = this.extractResponseError(camelizedData)
      const message = this.resolveResponseMessage(responseError, error)
      const errorDetails: ErrorDetails = this.buildResponseErrorDetails(
        responseError,
        error,
        durationMs,
        requestIdFromHeaders
      )
      const responseCode = this.resolveResponseCode(responseError, error.response.status)

      const apiError = new ApiException(message, responseCode, errorDetails)
      this.onError?.(
        normalizeTelemetry({
          method: (error.config?.method || DEFAULT_METHOD).toUpperCase(),
          url: error.config?.url || error.response?.config?.url,
          status: error.response?.status,
          durationMs,
          requestId: errorDetails.requestId as unknown as string,
          correlationId: extractHeaderString(error.config?.headers?.[HEADER_CORRELATION_ID]),
          error: apiError,
        })
      )
      return apiError
    }

    if (error.request) {
      const errorDetails: ErrorDetails = {
        status: 0,
        statusText: ERROR_MESSAGE_NO_RESPONSE,
        ...(error.code ? { code: error.code } : {}),
        ...(durationMs !== undefined ? { durationMs } : {}),
        ...(requestIdFromHeaders ? { requestId: requestIdFromHeaders } : {}),
      }
      const message = error.message || ERROR_MESSAGE_NETWORK_NO_RESPONSE
      const networkError = new NetworkException(message, errorDetails, error)
      this.onError?.(
        normalizeTelemetry({
          method: (error.config?.method || DEFAULT_METHOD).toUpperCase(),
          url: error.config?.url,
          status: 0,
          durationMs,
          requestId: requestIdFromHeaders,
          correlationId: extractHeaderString(error.config?.headers?.[HEADER_CORRELATION_ID]),
          error: networkError,
        })
      )
      return networkError
    }

    const errorDetails: ErrorDetails = {
      ...(error.code ? { code: error.code } : {}),
      ...(durationMs !== undefined ? { durationMs } : {}),
      ...(requestIdFromHeaders ? { requestId: requestIdFromHeaders } : {}),
    }
    const message = error.message || ERROR_MESSAGE_CLIENT_CONFIGURATION
    const clientError = new ClientConfigurationException(message, errorDetails)
    this.onError?.(
      normalizeTelemetry({
        method: (error.config?.method || DEFAULT_METHOD).toUpperCase(),
        url: error.config?.url,
        status: (error as AxiosError)?.response?.status ?? 0,
        durationMs,
        requestId: requestIdFromHeaders,
        correlationId: extractHeaderString(error.config?.headers?.[HEADER_CORRELATION_ID]),
        error: clientError,
      })
    )
    return clientError
  }

  private extractResponseError(camelizedData: unknown): Record<string, unknown> | undefined {
    if (
      typeof camelizedData === 'object' &&
      camelizedData !== null &&
      'error' in camelizedData &&
      typeof (camelizedData as { error: unknown }).error === 'object' &&
      (camelizedData as { error: unknown }).error !== null
    ) {
      return (camelizedData as { error: Record<string, unknown> }).error
    }
    return undefined
  }

  private resolveResponseMessage(responseError: Record<string, unknown> | undefined, error: AxiosError): string {
    if (responseError && typeof responseError.message === 'string' && responseError.message.trim().length > 0) {
      return responseError.message
    }
    if (typeof error.response?.statusText === 'string' && error.response.statusText.trim().length > 0) {
      return error.response.statusText
    }
    return error.message || ERROR_MESSAGE_REQUEST_FAILED
  }

  private resolveResponseCode(responseError: Record<string, unknown> | undefined, status: number): string {
    if (responseError && typeof responseError.code === 'string' && responseError.code.trim().length > 0) {
      return responseError.code
    }
    return `HTTP_${status}`
  }

  private buildResponseErrorDetails(
    responseError: Record<string, unknown> | undefined,
    error: AxiosError,
    durationMs?: number,
    requestIdFromHeaders?: string
  ): ErrorDetails {
    const details: ErrorDetails = {
      status: error.response?.status,
      statusText: String(error.response?.statusText),
    }

    if (responseError?.code && typeof responseError.code === 'string') {
      details.code = responseError.code
    }
    if (responseError?.requestId && typeof responseError.requestId === 'string') {
      details.requestId = responseError.requestId
    }
    if (durationMs !== undefined) {
      details.durationMs = durationMs
    }
    if (requestIdFromHeaders) {
      details.requestId = details.requestId ?? requestIdFromHeaders
    }

    return details
  }

  setAuthToken(token: string | null): void {
    this.authToken = token
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  async get<T = Record<string, never>>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const axiosConfig: AxiosRequestConfig | undefined = config
      ? {
          ...config,
          headers: {
            ...(this.axiosInstance.defaults.headers?.common || {}),
            ...config.headers,
          },
          signal: config.signal,
        }
      : undefined

    return this.executeWithRetry('get', async () => {
      const response = await this.axiosInstance.get<T>(url, axiosConfig)
      return this.toHttpResponse(response)
    })
  }

  async post<T = Record<string, never>>(
    url: string,
    data?: HttpData,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const axiosConfig: AxiosRequestConfig | undefined = config
      ? {
          ...config,
          headers: {
            ...(this.axiosInstance.defaults.headers?.common || {}),
            ...config.headers,
          },
          signal: config.signal,
        }
      : undefined

    const response = await this.axiosInstance.post<T>(url, data, axiosConfig)
    return this.toHttpResponse(response)
  }

  async put<T = Record<string, never>>(
    url: string,
    data?: HttpData,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const axiosConfig: AxiosRequestConfig | undefined = config
      ? {
          ...config,
          headers: {
            ...(this.axiosInstance.defaults.headers?.common || {}),
            ...config.headers,
          },
          signal: config.signal,
        }
      : undefined

    const response = await this.axiosInstance.put<T>(url, data, axiosConfig)
    return this.toHttpResponse(response)
  }

  async patch<T = Record<string, never>>(
    url: string,
    data?: HttpData,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    const axiosConfig: AxiosRequestConfig | undefined = config
      ? {
          ...config,
          headers: {
            ...(this.axiosInstance.defaults.headers?.common || {}),
            ...config.headers,
          },
          signal: config.signal,
        }
      : undefined

    const response = await this.axiosInstance.patch<T>(url, data, axiosConfig)
    return this.toHttpResponse(response)
  }

  async delete<T = Record<string, never>>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    const axiosConfig: AxiosRequestConfig | undefined = config
      ? {
          ...config,
          headers: {
            ...(this.axiosInstance.defaults.headers?.common || {}),
            ...config.headers,
          },
          signal: config.signal,
        }
      : undefined

    const response = await this.axiosInstance.delete<T>(url, axiosConfig)
    return this.toHttpResponse(response)
  }

  private enrichRequestConfig(config: AxiosRequestConfig): AxiosRequestConfigWithMeta {
    const cfg = config as AxiosRequestConfigWithMeta
    if (!cfg.headers) {
      cfg.headers = {}
    }
    // Respect signal from config
    if (config.signal) {
      cfg.signal = config.signal
    }
    if (this.authToken) {
      cfg.headers[HEADER_AUTHORIZATION] = `${HEADER_BEARER_PREFIX}${this.authToken}`
    }

    if (this.includeTraceHeaders) {
      const requestId = (cfg.headers[HEADER_REQUEST_ID] as string | undefined) ?? this.generateRequestId()
      const correlationId =
        (cfg.headers[HEADER_CORRELATION_ID] as string | undefined) ?? this.baseCorrelationId ?? requestId

      cfg.headers[HEADER_REQUEST_ID] = requestId
      cfg.headers[HEADER_CORRELATION_ID] = correlationId

      cfg.metadata = {
        start: Date.now(),
        requestId,
      }
    }

    return cfg
  }

  private extractHeaders(
    headers: Record<string, string | number | string[] | number[] | boolean | null | undefined>
  ): Record<string, string> {
    const result: Record<string, string> = {}
    for (const key of Object.keys(headers)) {
      const value = headers[key]
      const normalized = extractHeaderString(value)
      if (normalized !== undefined) {
        result[key] = normalized
      }
    }
    return result
  }

  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    return `req-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
  }

  private getDuration(error: AxiosError): number | undefined {
    const config = error.config as AxiosRequestConfigWithMeta | undefined
    if (config?.metadata?.durationMs !== undefined) {
      return config.metadata.durationMs
    }
    if (config?.metadata?.start !== undefined) {
      return Date.now() - config.metadata.start
    }
    return undefined
  }

  private toHttpResponse<T = Record<string, never>>(response: AxiosResponse<T>): HttpResponse<T> {
    const metadata = (response.config as AxiosRequestConfigWithMeta)?.metadata
    const durationMs = metadata?.durationMs

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: this.extractHeaders(
        response.headers as Record<string, string | number | string[] | number[] | boolean | null | undefined>
      ),
      ...(durationMs !== undefined ? { durationMs } : {}),
    }
  }

  private async executeWithRetry<T>(method: string, operation: () => Promise<T>): Promise<T> {
    const isIdempotent = ['get', 'head', 'options'].includes(method.toLowerCase())
    let attempt = 0
    while (true) {
      try {
        return await operation()
      } catch (error) {
        const shouldRetry = this.shouldRetry(error, isIdempotent, attempt)
        if (!shouldRetry) {
          this.onError?.(
            normalizeTelemetry({
              method: method.toUpperCase(),
              url: (error as AxiosError)?.config?.url,
              status: error instanceof ApiException ? error.errorDetails?.status : undefined,
              attempt,
              error,
            })
          )
          throw error
        }
        attempt += 1
        this.onError?.(
          normalizeTelemetry({
            method: method.toUpperCase(),
            url: (error as AxiosError)?.config?.url,
            status: error instanceof ApiException ? error.errorDetails?.status : undefined,
            attempt,
            error,
          })
        )
        await this.delay(this.retryDelayMs * attempt)
      }
    }
  }

  private shouldRetry(error: unknown, isIdempotent: boolean, attempt: number): boolean {
    if (!isIdempotent) {
      return false
    }
    if (attempt >= this.retryAttempts) {
      return false
    }
    if (error instanceof NetworkException) {
      return true
    }
    if (error instanceof ApiException) {
      const status = error.errorDetails?.status
      // Do not retry on 500 (Internal Server Error) to avoid hammering the server
      return status === 429 || status === 503
    }
    return false
  }

  private async delay(ms: number): Promise<void> {
    if (ms <= 0) {
      return
    }
    await new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}
