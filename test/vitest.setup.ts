import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { ENV_VAR_API_BASE_URL } from '../src/app/constants'
import { handlers } from './msw/handlers'
import { server } from './msw/server'

const mutableEnv = import.meta.env as Record<string, string | undefined>
if (!mutableEnv[ENV_VAR_API_BASE_URL]) {
  mutableEnv[ENV_VAR_API_BASE_URL] = 'http://localhost:4000'
}

beforeAll(() =>
  server.listen({
    onUnhandledRequest: (req) => {
      const url = new URL(req.url.toString())
      console.warn(`Unhandled ${req.method} ${url.href}`)
    },
  })
)
afterEach(() => server.resetHandlers(...handlers))
afterAll(() => server.close())

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Global mocks for context hooks to handle missing providers in unit tests
// while allowing integration tests to use real providers.

vi.mock('../src/app/logging/loggerContext', async () => {
  const actual = await vi.importActual<typeof import('../src/app/logging/loggerContext')>(
    '../src/app/logging/loggerContext'
  )
  return {
    ...actual,
    useLogger: () => {
      try {
        return actual.useLogger()
      } catch {
        return {
          debug: vi.fn(),
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
        }
      }
    },
  }
})

vi.mock('../src/app/live/useAdminSystemLiveFeed', async () => {
  const actual = await vi.importActual<typeof import('../src/app/live/useAdminSystemLiveFeed')>(
    '../src/app/live/useAdminSystemLiveFeed'
  )
  return {
    ...actual,
    useAdminSystemLiveFeed: () => {
      try {
        return actual.useAdminSystemLiveFeed()
      } catch {
        return {
          state: {
            connectionStatus: 'disconnected',
            lastHealthUpdate: null,
            lastError: null,
          },
          requestHealth: vi.fn(),
        }
      }
    },
  }
})

/**
 * Vitest Setup
 * Initializes test infrastructure for React components
 */

import '@testing-library/jest-dom'
