import * as path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./tests/vitest.setup.ts'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    environmentMatchGlobs: [
      ['tests/unit/hooks/**', 'jsdom'],
      ['tests/unit/exceptions/**', 'node'],
      ['tests/unit/http/**', 'node'],
      ['tests/unit/client/**', 'node'],
      ['tests/integration/**', 'node'],
    ],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'clover'],
      reportsDirectory: 'coverage',
      reportOnFailure: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/index.ts',
        'src/types/**/*.ts',
        '**/index.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
    },
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'tests'),
    },
  },
})
