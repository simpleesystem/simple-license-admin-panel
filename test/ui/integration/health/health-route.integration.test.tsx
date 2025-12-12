import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { HealthRouteComponent } from '../../../../src/routes/health/HealthRoute'
import { UI_HEALTH_METRICS_TITLE, UI_SYSTEM_METRICS_TITLE, UI_SYSTEM_STATUS_TITLE } from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

describe('HealthRouteComponent (integration)', () => {
  test('renders live health panels with server data', async () => {
    renderWithProviders(<HealthRouteComponent />)

    expect(await screen.findByText(UI_SYSTEM_STATUS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_HEALTH_METRICS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_SYSTEM_METRICS_TITLE)).toBeInTheDocument()
  })
})
