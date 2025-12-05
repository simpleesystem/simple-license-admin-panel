import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

import { ApiContext } from '../../../src/api/apiContext'
import { AuthProvider } from '../../../src/app/auth/AuthProvider'
import { AppProviders } from '../../../src/app/AppProviders'

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

export const renderWithProviders = (ui: ReactElement, options?: RenderWithProvidersOptions) => {
  const queryClient = options?.queryClient ?? createTestQueryClient()
  const apiClient = options?.client ?? ({} as unknown)

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={apiClient}>
        <AppProviders>
          <AuthProvider>{ui}</AuthProvider>
        </AppProviders>
      </ApiContext.Provider>
    </QueryClientProvider>,
  )
}

