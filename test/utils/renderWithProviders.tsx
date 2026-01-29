import { render } from '@testing-library/react'
import type { ReactElement } from 'react'

import { AppProviders } from '../../src/app/AppProviders'

export const renderWithProviders = (ui: ReactElement) => {
  return render(<AppProviders>{ui}</AppProviders>)
}
