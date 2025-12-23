import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { TenantQuotaPanel } from '../../../src/ui/workflows/TenantQuotaPanel'

const useQuotaUsageMock = vi.hoisted(() => vi.fn())
const useQuotaConfigMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useQuotaUsage: useQuotaUsageMock,
    useQuotaConfig: useQuotaConfigMock,
  }
})

const latestFormProps: { current?: { onSuccess?: () => void; show: boolean } } = {}

vi.mock('../../../src/ui/workflows/TenantQuotaFormFlow', () => ({
  TenantQuotaFormFlow: (props: { show: boolean; onSuccess?: () => void }) => {
    latestFormProps.current = props
    return props.show ? <div data-testid="tenant-quota-form">Form</div> : null
  },
}))

const createUsage = () => ({
  usage: {
    products_count: 5,
    activations_count: 25,
    max_products: 100,
    max_activations_total: 500,
    max_activations_per_product: 50,
  },
})

const createConfig = () => ({
  config: {
    max_products: 100,
    max_products_soft: 80,
    max_activations_per_product: 50,
    max_activations_total: 500,
    quota_warning_threshold: 90,
  },
})

describe('TenantQuotaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useQuotaUsageMock.mockReturnValue({
      data: createUsage(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useQuotaConfigMock.mockReturnValue({
      data: createConfig(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
  })

  test('renders quota summary data', () => {
    render(<TenantQuotaPanel client={{} as never} tenantId="tenant-1" />)

    expect(screen.getByText('Products (used / max)')).toBeInTheDocument()
    expect(screen.getByText('5 / 100')).toBeInTheDocument()
    expect(screen.getByText('Activations (used / max)')).toBeInTheDocument()
    expect(screen.getByText('25 / 500')).toBeInTheDocument()
  })

  test('formats missing values as em dash', () => {
    useQuotaUsageMock.mockReturnValueOnce({
      data: {
        usage: {
          products_count: 1,
          activations_count: 2,
          max_products: null,
          max_activations_total: null,
          max_activations_per_product: null,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useQuotaConfigMock.mockReturnValueOnce({
      data: createConfig(),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    render(<TenantQuotaPanel client={{} as never} tenantId="tenant-1" />)
    expect(screen.getByText('1 / —')).toBeInTheDocument()
    expect(screen.getByText('2 / —')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  test('opens edit modal when CTA clicked', () => {
    render(<TenantQuotaPanel client={{} as never} tenantId="tenant-1" />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Quotas' }))
    expect(screen.getByTestId('tenant-quota-form')).toBeInTheDocument()
  })

  test('renders loading alert while fetching data', () => {
    useQuotaUsageMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })
    useQuotaConfigMock.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    render(<TenantQuotaPanel client={{} as never} tenantId="tenant-1" />)
    expect(screen.getByText('Loading quota data')).toBeInTheDocument()
  })

  test('renders error alert when queries fail', () => {
    useQuotaUsageMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })
    useQuotaConfigMock.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    })

    render(<TenantQuotaPanel client={{} as never} tenantId="tenant-1" />)
    expect(screen.getByText('Unable to load quotas')).toBeInTheDocument()
  })

  test('refetches usage/config after successful submission', async () => {
    const usageRefetch = vi.fn(async () => {})
    const configRefetch = vi.fn(async () => {})
    useQuotaUsageMock.mockReturnValue({
      data: createUsage(),
      isLoading: false,
      isError: false,
      refetch: usageRefetch,
    })
    useQuotaConfigMock.mockReturnValue({
      data: createConfig(),
      isLoading: false,
      isError: false,
      refetch: configRefetch,
    })
    const onUpdated = vi.fn()

    render(<TenantQuotaPanel client={{} as never} tenantId="tenant-1" onUpdated={onUpdated} />)
    fireEvent.click(screen.getByRole('button', { name: 'Edit Quotas' }))

    await waitFor(() => {
      expect(latestFormProps.current?.onSuccess).toBeDefined()
    })
    await latestFormProps.current?.onSuccess?.()

    expect(usageRefetch).toHaveBeenCalled()
    expect(configRefetch).toHaveBeenCalled()
    expect(onUpdated).toHaveBeenCalled()
  })
})


