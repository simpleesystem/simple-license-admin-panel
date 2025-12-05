/**
 * HTTP Client Interface
 * Abstraction for HTTP operations to allow for different implementations
 */

// HTTP request/response data types - JSON serializable values
// Accepting any object/array for typed request bodies from our API types
// Using a non-recursive approach to avoid circular reference
export type HttpDataPrimitive = string | number | boolean | null
export type HttpDataArray =
  | HttpDataPrimitive[]
  | Array<Record<string, HttpDataPrimitive | HttpDataPrimitive[] | Record<string, HttpDataPrimitive>>>
export type HttpDataObject = Record<
  string,
  HttpDataPrimitive | HttpDataArray | Record<string, HttpDataPrimitive | HttpDataPrimitive[]>
>
export type HttpData = HttpDataPrimitive | HttpDataArray | HttpDataObject | object

export interface HttpResponse<T = Record<string, never>> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface HttpRequestConfig {
  headers?: Record<string, string>
  timeout?: number
}

export interface HttpClientInterface {
  get<T = Record<string, never>>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  post<T = Record<string, never>>(url: string, data?: HttpData, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  put<T = Record<string, never>>(url: string, data?: HttpData, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  patch<T = Record<string, never>>(url: string, data?: HttpData, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  delete<T = Record<string, never>>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>
}
