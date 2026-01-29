import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

export const renderWithQueryClient = (ui: ReactElement, options?: { queryClient?: QueryClient }) => {
  const queryClient =
    options?.queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}
