import { RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { AppProviders } from '../../src/app/AppProviders'
import { router } from '../../src/app/router'

export const renderWithAllProviders = (ui: ReactElement) => {
  return render(
    <AppProviders>
      <RouterProvider router={router}>{ui}</RouterProvider>
    </AppProviders>
  )
}
