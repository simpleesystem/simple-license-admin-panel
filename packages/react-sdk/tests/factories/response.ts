/**
 * Response Factory Helpers
 * Create API response objects for testing - zero hardcoded values
 */

import type { ApiResponse } from '@/types/api'
import { TEST_BOOLEAN_FALSE, TEST_BOOLEAN_TRUE, TEST_HTTP_STATUS_OK } from '../constants'

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: TEST_BOOLEAN_TRUE,
    data,
  }
}

export function createErrorResponse(code: string, message: string): ApiResponse {
  return {
    success: TEST_BOOLEAN_FALSE,
    error: {
      code,
      message,
    },
  }
}

export function createHttpResponse<T>(data: T, status: number = TEST_HTTP_STATUS_OK) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
  }
}

export function createPaginatedResponse<T>(
  items: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
): ApiResponse<{ data: T[]; pagination: typeof pagination }> {
  return {
    success: TEST_BOOLEAN_TRUE,
    data: {
      data: items,
      pagination,
    },
  }
}
