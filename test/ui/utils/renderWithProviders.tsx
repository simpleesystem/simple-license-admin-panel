import type { Client } from '@/simpleLicense'
import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { vi } from 'vitest'

import { AppProviders } from '../../../src/app/AppProviders'
import { AdminSystemLiveFeedContext } from '../../../src/app/live/AdminSystemLiveFeedContextDef'
import { ADMIN_SYSTEM_WS_STATUS_DISCONNECTED } from '../../../src/app/constants'

type RenderWithProvidersOptions = {
  client?: unknown
  queryClient?: QueryClient
}

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

const mockLiveContext = {
  state: {
    connectionStatus: ADMIN_SYSTEM_WS_STATUS_DISCONNECTED,
    lastHealthUpdate: null,
    lastError: null,
  },
  requestHealth: () => {},
}

const defaultMockClient = {
  restoreSession: vi.fn().mockResolvedValue(null),
  changePassword: vi.fn().mockResolvedValue({}),
} as unknown as Client

export const renderWithProviders = (ui: ReactElement, options?: RenderWithProvidersOptions) => {
  const queryClient = options?.queryClient ?? createTestQueryClient()
  const apiClient = (options?.client ?? defaultMockClient) as Client

  return render(
    <AdminSystemLiveFeedContext.Provider value={mockLiveContext}>
      <AppProviders queryClient={queryClient} apiClient={apiClient}>
        {ui}
      </AppProviders>
    </AdminSystemLiveFeedContext.Provider>
  )
}
