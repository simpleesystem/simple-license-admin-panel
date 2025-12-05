import { faker } from '@faker-js/faker'
import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { UI_USAGE_TRENDS_EMPTY_STATE, UI_USAGE_TRENDS_ERROR_BODY, UI_USAGE_TRENDS_ERROR_TITLE, UI_USAGE_TRENDS_LOADING_BODY, UI_USAGE_TRENDS_LOADING_TITLE, UI_USAGE_TRENDS_TITLE } from '../../../../src/ui/constants'
import { UsageTrendsPanel } from '../../../../src/ui/workflows/UsageTrendsPanel'
import { renderWithProviders } from '../../utils'

const useUsageTrendsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useUsageTrends: useUsageTrendsMock,
  }
})

describe('UsageTrendsPanel integration', () => {
  test('renders trend data', () => {
    useUsageTrendsMock.mockReturnValue({
      data: {
        items: [
          {
            id: faker.string.uuid(),
            label: 'Metric A',
            value: 10,
          },
        ],
      },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<UsageTrendsPanel client={{} as never} />)

    expect(screen.getByText(UI_USAGE_TRENDS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('Metric A')).toBeInTheDocument()
  })

  test('shows loading, empty, and error states', () => {
    useUsageTrendsMock
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        isError: false,
      })
      .mockReturnValueOnce({
        data: { items: [] },
        isLoading: false,
        isError: false,
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        isError: true,
      })

    const { rerender } = renderWithProviders(<UsageTrendsPanel client={{} as never} />)

    expect(screen.getByText(UI_USAGE_TRENDS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_USAGE_TRENDS_LOADING_BODY)).toBeInTheDocument()

    rerender(<UsageTrendsPanel client={{} as never} />)
    expect(screen.getByText(UI_USAGE_TRENDS_EMPTY_STATE)).toBeInTheDocument()

    rerender(<UsageTrendsPanel client={{} as never} />)
    expect(screen.getByText(UI_USAGE_TRENDS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_USAGE_TRENDS_ERROR_BODY)).toBeInTheDocument()
  })
})

