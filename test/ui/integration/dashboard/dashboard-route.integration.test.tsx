import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { DashboardRouteComponent } from '../../../../src/routes/dashboard/DashboardRoute'
import {
  UI_ANALYTICS_STATS_TITLE,
  UI_ANALYTICS_SUMMARY_DESCRIPTION,
  UI_ANALYTICS_SUMMARY_TITLE,
} from '../../../../src/ui/constants'
import { renderWithProviders } from '../../utils'

describe('DashboardRouteComponent (integration)', () => {
  test('renders dashboard panels with live data and empty states', async () => {
    renderWithProviders(<DashboardRouteComponent />)

    expect(await screen.findByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_ANALYTICS_SUMMARY_DESCRIPTION)).toBeInTheDocument()
  })
})
