// @vitest-environment node

import { describe, expect, it } from 'vitest'

import viteConfig, { PREVIEW_ALLOWED_HOST_LICENSE_ADMIN } from '../vite.config'

describe('vite preview allowedHosts', () => {
  it('allows the production admin panel host', () => {
    const resolvedConfig = typeof viteConfig === 'function' ? viteConfig({ command: 'serve', mode: 'test' }) : viteConfig

    expect(resolvedConfig.preview?.allowedHosts).toContain(PREVIEW_ALLOWED_HOST_LICENSE_ADMIN)
  })
})
