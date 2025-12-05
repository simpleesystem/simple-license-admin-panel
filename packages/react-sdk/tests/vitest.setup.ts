/**
 * Vitest Setup
 * Initializes MSW server and test infrastructure
 */

import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './msw/server'

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  // Reset handlers after each test
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
