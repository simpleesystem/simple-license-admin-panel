import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { TenantQuotaPanel } from '../../../../src/ui/workflows/TenantQuotaPanel'
import { renderWithProviders } from '../../utils'

const useQuotaUsageMock = vi.hoisted(() => vi.fn())
const useQuotaConfigMock = vi.hoisted(() => vi.fn())
const useUpdateQuotaLimitsMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useQuotaUsage: useQuotaUsageMock,
    useQuotaConfig: useQuotaConfigMock,
    useUpdateQuotaLimits: useUpdateQuotaLimitsMock,
  }
})

vi.mock('../../../../src/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('../../../../src/app/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { role: 'SUPERUSER', email: 'test@example.com' },
  }),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('TenantQuotaPanel integration', () => {
  test('renders quotas, opens edit modal, and refreshes on success', async () => {
    const tenantId = faker.string.uuid()
    const onUpdated = vi.fn()
    const usageRefetch = vi.fn()
    const configRefetch = vi.fn()
    const updateMutation = mockMutation()
    updateMutation.mutateAsync.mockImplementation(async () => {
      onUpdated()
      return {}
    })
    useQuotaUsageMock.mockReturnValue({
      data: {
        usage: {
          products_count: 2,
          max_products: 5,
          activations_count: 10,
          max_activations_total: 20,
          max_activations_per_product: 3,
        },
      },
      isLoading: false,
      isError: false,
      refetch: usageRefetch,
    })
    useQuotaConfigMock.mockReturnValue({
      data: { config: { max_products: 5, max_activations_total: 20 } },
      isLoading: false,
      isError: false,
      refetch: configRefetch,
    })
    useUpdateQuotaLimitsMock.mockReturnValue(updateMutation)

    renderWithProviders(<TenantQuotaPanel client={{} as never} tenantId={tenantId} onUpdated={onUpdated} />)

    expect(screen.getByText(/Quota Limits/i)).toBeInTheDocument()
    expect(screen.getByText(/Products \(used \/ max\)/i)).toBeInTheDocument()
    expect(screen.getByText('2 / 5')).toBeInTheDocument()

    fireEvent.click(screen.getByText(/Edit Quotas/i))
    fireEvent.click(screen.getByRole('button', { name: /Save quotas/i }))

    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalled()
    })
  })

  test('shows loading then error state', () => {
    useUpdateQuotaLimitsMock.mockReturnValue(mockMutation())
    useQuotaUsageMock
      .mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      })
      .mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      })

    useQuotaConfigMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { rerender } = renderWithProviders(<TenantQuotaPanel client={{} as never} tenantId={faker.string.uuid()} />)

    expect(screen.getByText(/Loading quota data/i)).toBeInTheDocument()

    rerender(<TenantQuotaPanel client={{} as never} tenantId={faker.string.uuid()} />)
    expect(screen.getByText(/Unable to load quotas/i)).toBeInTheDocument()
  })
})
