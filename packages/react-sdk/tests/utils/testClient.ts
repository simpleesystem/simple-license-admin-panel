/**
 * Test Client Utilities
 * Helper functions for creating test clients
 */

import { Client } from '@/client'
import type { AxiosHttpClient } from '@/http/AxiosHttpClient'
import { TEST_BASE_URL } from '../constants'

/**
 * Create a test client with a mock HTTP client
 */
export function createTestClient(baseUrl: string = TEST_BASE_URL, httpClient?: AxiosHttpClient): Client {
  return new Client(baseUrl, httpClient)
}

/**
 * Create a test client with default configuration
 */
export function createDefaultTestClient(): Client {
  return new Client(TEST_BASE_URL)
}
