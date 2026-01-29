import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const CHUNK_REACT = 'chunk-react'
const CHUNK_FORMS = 'chunk-forms'
const CHUNK_I18N = 'chunk-i18n'
const CHUNK_EVENTS = 'chunk-events'
const CHUNK_ANALYTICS = 'chunk-analytics'
const CHUNK_TENANT = 'chunk-tenant'

export const VITE_HTML_ENTRY_INDEX = 'index.html'
export const VITE_HTML_ENTRY_NOT_FOUND = '404.html'

const CHUNK_GROUPS = [
  {
    name: CHUNK_REACT,
    modules: ['react', 'react-dom', 'react-bootstrap', 'react-hook-form', 'react-i18next', '@tanstack/react-query'],
  },
  { name: CHUNK_FORMS, modules: ['joi'] },
  { name: CHUNK_I18N, modules: ['i18next'] },
  { name: CHUNK_EVENTS, modules: ['mitt'] },
]

const WORKFLOWS_DIR = fileURLToPath(new URL('./src/ui/workflows', import.meta.url))
const ANALYTICS_SEGMENTS = ['AnalyticsStatsPanel', 'UsageTrendsPanel']
const TENANT_SEGMENTS = ['TenantQuotaPanel', 'TenantQuotaFormFlow', 'TenantFormFlow', 'TenantManagementExample']
const HTML_ENTRY_INDEX_PATH = `./${VITE_HTML_ENTRY_INDEX}`
const HTML_ENTRY_NOT_FOUND_PATH = `./${VITE_HTML_ENTRY_NOT_FOUND}`

const includesModule = (id: string, pkg: string) => id.includes(`/node_modules/${pkg}/`)
const matchesSegment = (id: string, segment: string) => id.startsWith(`${WORKFLOWS_DIR}/${segment}`)

export const PREVIEW_ALLOWED_HOST_LICENSE_ADMIN = 'license-admin.simpleaisystem.com'

const selectWorkflowChunk = (id: string) => {
  if (ANALYTICS_SEGMENTS.some((segment) => matchesSegment(id, segment))) {
    return CHUNK_ANALYTICS
  }
  if (TENANT_SEGMENTS.some((segment) => matchesSegment(id, segment))) {
    return CHUNK_TENANT
  }
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url)),
    },
  },
  preview: {
    allowedHosts: [PREVIEW_ALLOWED_HOST_LICENSE_ADMIN],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL(HTML_ENTRY_INDEX_PATH, import.meta.url)),
        notFound: fileURLToPath(new URL(HTML_ENTRY_NOT_FOUND_PATH, import.meta.url)),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const chunkGroup = CHUNK_GROUPS.find(({ modules }) => modules.some((pkg) => includesModule(id, pkg)))
            if (chunkGroup) {
              return chunkGroup.name
            }
          }

          if (id.startsWith(WORKFLOWS_DIR)) {
            return selectWorkflowChunk(id)
          }

          return undefined
        },
      },
    },
  },
})
