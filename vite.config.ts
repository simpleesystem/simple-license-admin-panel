import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const CHUNK_REACT = 'chunk-react'
const CHUNK_REACT_QUERY = 'chunk-react-query'
const CHUNK_BOOTSTRAP = 'chunk-bootstrap'
const CHUNK_FORMS = 'chunk-forms'
const CHUNK_I18N = 'chunk-i18n'
const CHUNK_EVENTS = 'chunk-events'
const CHUNK_SDK = 'chunk-sdk'
const CHUNK_ANALYTICS = 'chunk-analytics'
const CHUNK_TENANT = 'chunk-tenant'

const CHUNK_GROUPS = [
  { name: CHUNK_REACT, modules: ['react', 'react-dom'] },
  { name: CHUNK_REACT_QUERY, modules: ['@tanstack/react-query'] },
  { name: CHUNK_BOOTSTRAP, modules: ['react-bootstrap'] },
  { name: CHUNK_FORMS, modules: ['react-hook-form', 'joi'] },
  { name: CHUNK_I18N, modules: ['i18next', 'react-i18next'] },
  { name: CHUNK_EVENTS, modules: ['mitt'] },
]

const SDK_DEPENDENCIES = ['@simple-license/react-sdk']

const WORKFLOWS_DIR = fileURLToPath(new URL('./src/ui/workflows', import.meta.url))
const ANALYTICS_SEGMENTS = ['AnalyticsStatsPanel', 'UsageTrendsPanel']
const TENANT_SEGMENTS = ['TenantQuotaPanel', 'TenantQuotaFormFlow', 'TenantFormFlow', 'TenantManagementExample']

const includesModule = (id: string, pkg: string) => id.includes(`/node_modules/${pkg}/`)
const matchesSegment = (id: string, segment: string) => id.startsWith(`${WORKFLOWS_DIR}/${segment}`)

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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const chunkGroup = CHUNK_GROUPS.find(({ modules }) => modules.some((pkg) => includesModule(id, pkg)))
            if (chunkGroup) {
              return chunkGroup.name
            }

            if (SDK_DEPENDENCIES.some((pkg) => includesModule(id, pkg))) {
              return CHUNK_SDK
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
