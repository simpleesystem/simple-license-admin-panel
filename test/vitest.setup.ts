import '@testing-library/jest-dom/vitest'

import { afterAll, afterEach, beforeAll, vi } from 'vitest'

import { ENV_VAR_API_BASE_URL } from '../src/app/constants'
import { server } from './msw/server'

const mutableEnv = import.meta.env as Record<string, string | undefined>
if (!mutableEnv[ENV_VAR_API_BASE_URL]) {
  mutableEnv[ENV_VAR_API_BASE_URL] = 'http://localhost:4000'
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
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
/**
 * Vitest Setup
 * Initializes test infrastructure for React components
 */

import '@testing-library/jest-dom'

