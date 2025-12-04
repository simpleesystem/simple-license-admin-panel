import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import type { AuditLogEntry, Client } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_AUDIT_LOGS_EMPTY_STATE,
  UI_AUDIT_LOGS_ERROR_BODY,
  UI_AUDIT_LOGS_ERROR_TITLE,
  UI_AUDIT_LOGS_FILTER_ACTION_LABEL,
  UI_AUDIT_LOGS_FILTER_APPLY_LABEL,
  UI_AUDIT_LOGS_LOADING_BODY,
  UI_AUDIT_LOGS_LOADING_TITLE,
  UI_AUDIT_LOGS_TITLE,
} from '../../../src/ui/constants'
import { AuditLogsPanel } from '../../../src/ui/workflows/AuditLogsPanel'

const useAuditLogsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAuditLogs: useAuditLogsMock,
  }
})

const createMockClient = () => ({}) as Client

const renderWithProviders = (ui: React.ReactElement, client: Client) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ApiContext.Provider value={{ client }}>{ui}</ApiContext.Provider>
    </QueryClientProvider>,
  )
}

const buildAuditLog = (): AuditLogEntry => ({
  id: faker.string.ulid(),
  adminId: faker.string.uuid(),
  adminUsername: faker.internet.email(),
  vendorId: faker.string.uuid(),
  action: 'UPDATE',
  resourceType: 'LICENSE',
  resourceId: faker.string.uuid(),
  details: { status: 'SUSPENDED' },
  ipAddress: faker.internet.ipv4(),
  userAgent: 'vitest',
  accessMethod: 'UI_API',
  unixUser: null,
  createdAt: faker.date.recent().toISOString(),
})

describe('AuditLogsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders audit logs when data is available', async () => {
    const client = createMockClient()
    const logs = [buildAuditLog()]
    useAuditLogsMock.mockReturnValue({
      data: { logs, total: logs.length },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AuditLogsPanel client={client} />, client)

    await waitFor(() => {
      expect(screen.getByText(UI_AUDIT_LOGS_TITLE)).toBeInTheDocument()
    })

    expect(screen.getByText(logs[0].action)).toBeInTheDocument()
    expect(screen.getByText(logs[0].resourceType)).toBeInTheDocument()
  })

  test('renders loading state', () => {
    const client = createMockClient()
    useAuditLogsMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderWithProviders(<AuditLogsPanel client={client} />, client)

    expect(screen.getByText(UI_AUDIT_LOGS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_AUDIT_LOGS_LOADING_BODY)).toBeInTheDocument()
  })

  test('renders error state', () => {
    const client = createMockClient()
    useAuditLogsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderWithProviders(<AuditLogsPanel client={client} />, client)

    expect(screen.getByText(UI_AUDIT_LOGS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_AUDIT_LOGS_ERROR_BODY)).toBeInTheDocument()
  })

  test('renders empty state when no logs exist', async () => {
    const client = createMockClient()
    useAuditLogsMock.mockReturnValue({
      data: { logs: [], total: 0 },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AuditLogsPanel client={client} />, client)

    await waitFor(() => {
      expect(screen.getByText(UI_AUDIT_LOGS_EMPTY_STATE)).toBeInTheDocument()
    })
  })

  test('submits filter form and requests new data', async () => {
    const client = createMockClient()
    useAuditLogsMock.mockReturnValue({
      data: { logs: [buildAuditLog()], total: 1 },
      isLoading: false,
      isError: false,
    })

    renderWithProviders(<AuditLogsPanel client={client} />, client)

    const actionInput = screen.getByLabelText(UI_AUDIT_LOGS_FILTER_ACTION_LABEL)
    fireEvent.change(actionInput, { target: { value: 'DELETE' } })
    fireEvent.click(screen.getByRole('button', { name: UI_AUDIT_LOGS_FILTER_APPLY_LABEL }))

    await waitFor(() => {
      const lastCall = useAuditLogsMock.mock.calls.at(-1)
      expect(lastCall?.[1]).toMatchObject({ action: 'DELETE' })
    })
  })
})

