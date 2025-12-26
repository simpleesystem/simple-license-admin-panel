import type { ReactElement } from 'react'
import { render } from '@testing-library/react'

import { AppProviders } from '../../src/app/AppProviders'
import { RouterProvider } from '@tanstack/react-router'
import { router } from '../../src/app/router'

export const renderWithAllProviders = (ui: ReactElement) => {
  return render(
    <AppProviders>
      <RouterProvider router={router}>{ui}</RouterProvider>
    </AppProviders>
  )
}

