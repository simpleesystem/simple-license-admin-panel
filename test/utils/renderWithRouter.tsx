import { RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

import { router } from '../../src/app/router'

export const renderWithRouter = (ui: ReactElement) => {
  return render(<RouterProvider router={router}>{ui}</RouterProvider>)
}
