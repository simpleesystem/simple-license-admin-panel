import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

import { ApiContext } from '../../../src/api/apiContext'

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
      <ApiContext.Provider value={apiClient}>{ui}</ApiContext.Provider>
    </QueryClientProvider>,
  )
}

