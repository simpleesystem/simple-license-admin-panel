import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Client } from '@simple-license/react-sdk'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { ApiContext } from '../../../src/api/apiContext'
import {
  UI_TENANT_BACKUP_BUTTON_LABEL,
  UI_TENANT_BACKUP_PENDING_LABEL,
  UI_TENANT_BACKUP_SUCCESS,
  UI_TENANT_BACKUP_TITLE,
} from '../../../src/ui/constants'
import { TenantBackupPanel } from '../../../src/ui/workflows/TenantBackupPanel'

const useCreateTenantBackupMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateTenantBackup: useCreateTenantBackupMock,
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

describe('TenantBackupPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders initial summary fields', () => {
    const client = createMockClient()
    useCreateTenantBackupMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    })

    renderWithProviders(
      <TenantBackupPanel
        client={client}
        tenantId="tenant-123"
        initialBackup={{
          id: 'backup-1',
          backupName: 'nightly',
          backupType: 'database',
          tenantId: 'tenant-123',
          backupMetadata: {},
          backupNotes: null,
          createdAt: '2023-01-01T00:00:00.000Z',
          metadata: {},
        }}
      />,
      client,
    )

    expect(screen.getByText(UI_TENANT_BACKUP_TITLE)).toBeInTheDocument()
    expect(screen.getByText('nightly')).toBeInTheDocument()
    expect(screen.getByText('database')).toBeInTheDocument()
  })

  test('triggers backup creation', async () => {
    const client = createMockClient()
    const mutateAsync = vi.fn(async () => ({
      backup: {
        id: 'backup-2',
        backupName: 'manual',
        backupType: 'database',
        tenantId: 'tenant-123',
        backup: '',
        backupMetadata: {},
        backupNotes: null,
        createdAt: new Date().toISOString(),
        metadata: {},
      },
    }))
    useCreateTenantBackupMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    })

    renderWithProviders(<TenantBackupPanel client={client} tenantId="tenant-123" />, client)

    fireEvent.click(screen.getByRole('button', { name: UI_TENANT_BACKUP_BUTTON_LABEL }))

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith('tenant-123')
    })

    expect(screen.getByText(UI_TENANT_BACKUP_SUCCESS)).toBeInTheDocument()
  })

  test('shows pending state while creating backup', () => {
    const client = createMockClient()
    useCreateTenantBackupMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    })

    renderWithProviders(<TenantBackupPanel client={client} tenantId="tenant-123" />, client)

    expect(screen.getByRole('button', { name: UI_TENANT_BACKUP_PENDING_LABEL })).toBeDisabled()
  })
})

