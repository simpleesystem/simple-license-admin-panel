import * as path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const projectRoot = process.cwd()
const tsconfigVitestPath = path.resolve(projectRoot, 'tsconfig.vitest.json')

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./test/vitest.setup.ts'],
    testTimeout: 15_000,
    hookTimeout: 15_000,
    environment: 'jsdom',
    typecheck: {
      tsconfig: tsconfigVitestPath,
    },
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
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/index.ts',
        'src/**/types.ts',
        'src/app/auth/persistedAuth.ts',
        'src/app/state/themeStorage.ts',
        'src/forms/fields/*.tsx',
        'src/utils/date.ts',
        'src/app/i18n/I18nProvider.tsx',
        'src/app/logging/sentryLogger.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'test'),
    },
  },
})
