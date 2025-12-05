import { faker } from '@faker-js/faker'
import { screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE,
  UI_ANALYTICS_ALERT_THRESHOLDS_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE,
  UI_ANALYTICS_LICENSE_DETAILS_TITLE,
  UI_ANALYTICS_STATS_LOADING_TITLE,
  UI_ANALYTICS_STATS_TITLE,
  UI_AUDIT_LOGS_LOADING_TITLE,
  UI_LICENSE_ACTIVATIONS_LOADING_TITLE,
  UI_LICENSE_ACTIVATIONS_TITLE,
  UI_USAGE_TRENDS_LOADING_TITLE,
} from '../../../../src/ui/constants'
import { AlertThresholdsPanel } from '../../../../src/ui/workflows/AlertThresholdsPanel'
import { AnalyticsStatsPanel } from '../../../../src/ui/workflows/AnalyticsStatsPanel'
import { AuditLogsPanel } from '../../../../src/ui/workflows/AuditLogsPanel'
import { LicenseActivationsPanel } from '../../../../src/ui/workflows/LicenseActivationsPanel'
import { LicenseUsageDetailsPanel } from '../../../../src/ui/workflows/LicenseUsageDetailsPanel'
import { TenantQuotaPanel } from '../../../../src/ui/workflows/TenantQuotaPanel'
import { UsageTrendsPanel } from '../../../../src/ui/workflows/UsageTrendsPanel'
import { renderWithProviders } from '../../utils'

const useSystemStatsMock = vi.hoisted(() => vi.fn())
const useHealthWebSocketMock = vi.hoisted(() => vi.fn())
const useLicenseActivationsMock = vi.hoisted(() => vi.fn())
const useLicenseUsageDetailsMock = vi.hoisted(() => vi.fn())
const useAuditLogsMock = vi.hoisted(() => vi.fn())
const useAlertThresholdsMock = vi.hoisted(() => vi.fn())
const useUpdateAlertThresholdsMock = vi.hoisted(() => vi.fn())
const useUsageTrendsMock = vi.hoisted(() => vi.fn())
const useQuotaUsageMock = vi.hoisted(() => vi.fn())
const useQuotaConfigMock = vi.hoisted(() => vi.fn())
const useUpdateQuotaMock = vi.hoisted(() => vi.fn())
const useUpdateQuotaLimitsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useSystemStats: useSystemStatsMock,
    useHealthWebSocket: useHealthWebSocketMock,
    useLicenseActivations: useLicenseActivationsMock,
    useLicenseUsageDetails: useLicenseUsageDetailsMock,
    useAuditLogs: useAuditLogsMock,
    useAlertThresholds: useAlertThresholdsMock,
    useUpdateAlertThresholds: useUpdateAlertThresholdsMock,
    useUsageTrends: useUsageTrendsMock,
    useQuotaUsage: useQuotaUsageMock,
    useQuotaConfig: useQuotaConfigMock,
    useUpdateQuota: useUpdateQuotaMock,
    useUpdateQuotaLimits: useUpdateQuotaLimitsMock,
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const happyMocks = () => {
  useSystemStatsMock.mockReturnValue({
    data: { stats: { active_licenses: 1, expired_licenses: 0, total_customers: 1, total_activations: 1 } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
  useHealthWebSocketMock.mockReturnValue({
    connectionInfo: { state: 'open' },
    error: null,
    requestHealth: vi.fn(),
    healthData: { stats: undefined },
  })
  useLicenseActivationsMock.mockReturnValue({
    data: { activations: [] },
    isLoading: false,
    isError: false,
  })
  useLicenseUsageDetailsMock.mockReturnValue({
    data: { licenseKey: 'KEY', licenseId: 1, summaries: [] },
    isLoading: false,
    isError: false,
  })
  useAuditLogsMock.mockReturnValue({
    data: { logs: [], total: 0 },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
  useAlertThresholdsMock.mockReturnValue({
    data: {
      high: { activations: 10, validations: 10, concurrency: 10 },
      medium: { activations: 5, validations: 5, concurrency: 5 },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
  useUpdateAlertThresholdsMock.mockReturnValue(mockMutation())
  useUsageTrendsMock.mockReturnValue({
    data: {
      trends: [{ period: '2024-01', totalActivations: 1, totalValidations: 1, totalUsageReports: 1 }],
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
    },
    isLoading: false,
    isError: false,
  })
  useQuotaUsageMock.mockReturnValue({
    data: {
      usage: {
        products_count: 1,
        max_products: 5,
        activations_count: 2,
        max_activations_total: 10,
        max_activations_per_product: 3,
      },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
  useQuotaConfigMock.mockReturnValue({
    data: { config: { max_products: 5, max_activations_total: 10 } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })
  useUpdateQuotaMock.mockReturnValue(mockMutation())
  useUpdateQuotaLimitsMock.mockReturnValue(mockMutation())
}

const TenantQuotaPanelShim = () => <TenantQuotaPanel client={{} as never} tenantId="tenant-1" />

describe('Combined dashboards render', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('happy path renders all panels together', async () => {
    happyMocks()
    const currentUser = { role: 'SUPERUSER', vendorId: faker.string.uuid() }
    const licenseVendorId = currentUser.vendorId
    renderWithProviders(
      <>
        <AnalyticsStatsPanel client={{} as never} />
        <UsageTrendsPanel client={{} as never} />
        <AuditLogsPanel client={{} as never} />
        <AlertThresholdsPanel client={{} as never} />
        <TenantQuotaPanelShim />
        <LicenseActivationsPanel client={{} as never} licenseId="lic-1" currentUser={currentUser} />
        <LicenseUsageDetailsPanel
          client={{} as never}
          licenseKey="LIC-123"
          licenseVendorId={licenseVendorId}
          currentUser={currentUser}
        />
      </>
    )

    expect(await screen.findByText(UI_ANALYTICS_STATS_TITLE)).toBeInTheDocument()
    expect(await screen.findAllByText(/Usage Trends/i)).toHaveLength(1)
    expect(await screen.findAllByText(/Audit Logs/i)).toHaveLength(1)
    expect(await screen.findByRole('heading', { name: UI_ANALYTICS_ALERT_THRESHOLDS_TITLE })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: UI_LICENSE_ACTIVATIONS_TITLE })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: UI_ANALYTICS_LICENSE_DETAILS_TITLE })).toBeInTheDocument()
  })

  test('loading then error states across panels', async () => {
    const currentUser = { role: 'SUPERUSER', vendorId: faker.string.uuid() }
    const licenseVendorId = currentUser.vendorId
    useSystemStatsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })
    useHealthWebSocketMock.mockReturnValue({
      connectionInfo: { state: 'connecting' },
      error: null,
      requestHealth: vi.fn(),
    })
    useLicenseActivationsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    useLicenseUsageDetailsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    useAuditLogsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })
    useAlertThresholdsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })
    useUpdateAlertThresholdsMock.mockReturnValue(mockMutation())
    useUsageTrendsMock.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    useQuotaUsageMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })
    useQuotaConfigMock.mockReturnValue({ data: undefined, isLoading: true, isError: false, refetch: vi.fn() })
    useUpdateQuotaMock.mockReturnValue(mockMutation())
    useUpdateQuotaLimitsMock.mockReturnValue(mockMutation())

    const { rerender } = renderWithProviders(
      <>
        <AnalyticsStatsPanel client={{} as never} />
        <UsageTrendsPanel client={{} as never} />
        <AuditLogsPanel client={{} as never} />
        <AlertThresholdsPanel client={{} as never} />
        <TenantQuotaPanelShim />
        <LicenseActivationsPanel client={{} as never} licenseId="lic-1" currentUser={currentUser} />
        <LicenseUsageDetailsPanel
          client={{} as never}
          licenseKey="LIC-123"
          licenseVendorId={licenseVendorId}
          currentUser={currentUser}
        />
      </>
    )

    expect(await screen.findByText(UI_ANALYTICS_STATS_LOADING_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_USAGE_TRENDS_LOADING_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_AUDIT_LOGS_LOADING_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_ANALYTICS_ALERT_THRESHOLDS_LOADING_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_LICENSE_ACTIVATIONS_LOADING_TITLE)).toBeInTheDocument()
    expect(await screen.findByText(UI_ANALYTICS_LICENSE_DETAILS_LOADING_TITLE)).toBeInTheDocument()

    useSystemStatsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })
    useLicenseActivationsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    useLicenseUsageDetailsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    useAuditLogsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })
    useAlertThresholdsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch: vi.fn() })
    useUsageTrendsMock.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    rerender(
      <>
        <AnalyticsStatsPanel client={{} as never} />
        <UsageTrendsPanel client={{} as never} />
        <AuditLogsPanel client={{} as never} />
        <AlertThresholdsPanel client={{} as never} />
        <TenantQuotaPanelShim />
        <LicenseActivationsPanel client={{} as never} licenseId="lic-1" currentUser={currentUser} />
        <LicenseUsageDetailsPanel
          client={{} as never}
          licenseKey="LIC-123"
          licenseVendorId={licenseVendorId}
          currentUser={currentUser}
        />
      </>
    )

    expect(screen.getAllByText(/unable to load/i).length).toBeGreaterThan(0)
  })
})

vi.mock('../../../../src/ui/workflows/TenantQuotaPanel', async () => {
  const actual = await vi.importActual<typeof import('../../../../src/ui/workflows/TenantQuotaPanel')>(
    '../../../../src/ui/workflows/TenantQuotaPanel'
  )
  return {
    ...actual,
    TenantQuotaPanel: ({ client, tenantId }: { client: unknown; tenantId: string }) => (
      <div data-testid="tenant-quota-panel">
        <actual.TenantQuotaPanel client={client as never} tenantId={tenantId} />
      </div>
    ),
  }
})
