// @vitest-environment node

import { describe, expect, it } from 'vitest'

import viteConfig, {
  PREVIEW_ALLOWED_HOST_LICENSE_ADMIN,
  VITE_HTML_ENTRY_INDEX,
  VITE_HTML_ENTRY_NOT_FOUND,
} from '../vite.config'

describe('vite preview allowedHosts', () => {
  it('allows the production admin panel host', () => {
    const resolvedConfig =
      typeof viteConfig === 'function' ? viteConfig({ command: 'serve', mode: 'test' }) : viteConfig

    expect(resolvedConfig.preview?.allowedHosts).toContain(PREVIEW_ALLOWED_HOST_LICENSE_ADMIN)
  })

  it('includes the SPA HTML entry points for direct navigation', () => {
    const resolvedConfig =
      typeof viteConfig === 'function' ? viteConfig({ command: 'serve', mode: 'test' }) : viteConfig
    const input = resolvedConfig.build?.rollupOptions?.input

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new Error('Expected Rollup input to be an object map.')
    }

    const inputEntries = Object.values(input)
    const hasIndexEntry = inputEntries.some((entry) => entry.endsWith(VITE_HTML_ENTRY_INDEX))
    const hasNotFoundEntry = inputEntries.some((entry) => entry.endsWith(VITE_HTML_ENTRY_NOT_FOUND))

    expect(hasIndexEntry).toBe(true)
    expect(hasNotFoundEntry).toBe(true)
  })
})
