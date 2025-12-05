import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_AUDIT_LOGS_ERROR_BODY,
  UI_AUDIT_LOGS_ERROR_TITLE,
  UI_AUDIT_LOGS_FILTER_APPLY_LABEL,
  UI_AUDIT_LOGS_FILTER_RESET_LABEL,
  UI_AUDIT_LOGS_LOADING_BODY,
  UI_AUDIT_LOGS_LOADING_TITLE,
  UI_AUDIT_LOGS_TITLE,
} from '../../../../src/ui/constants'
import { AuditLogsPanel } from '../../../../src/ui/workflows/AuditLogsPanel'
import { renderWithProviders } from '../../utils'

const useAuditLogsMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useAuditLogs: useAuditLogsMock,
  }
})

describe('AuditLogsPanel integration', () => {
  test('loads, filters, and resets logs', async () => {
    const logs = [
      {
        id: faker.string.uuid(),
        createdAt: new Date().toISOString(),
        action: 'CREATE',
        adminUsername: 'admin@example.com',
        resourceType: 'license',
        resourceId: 'LIC-1',
        details: { foo: 'bar' },
        ipAddress: '127.0.0.1',
        userAgent: 'UA',
      },
    ]
    const refetch = vi.fn()
    useAuditLogsMock.mockReturnValue({
      data: { logs, total: logs.length },
      isLoading: false,
      isError: false,
      refetch,
    })

    renderWithProviders(<AuditLogsPanel client={{} as never} />)

    expect(screen.getByText(UI_AUDIT_LOGS_TITLE)).toBeInTheDocument()
    expect(screen.getByText('CREATE')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/action/i), { target: { value: 'DELETE' } })
    fireEvent.click(screen.getByText(UI_AUDIT_LOGS_FILTER_APPLY_LABEL))
    fireEvent.click(screen.getByText(UI_AUDIT_LOGS_FILTER_RESET_LABEL))
  })

  test('shows loading then error state', () => {
    useAuditLogsMock
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

    const { rerender } = renderWithProviders(<AuditLogsPanel client={{} as never} />)

    expect(screen.getByText(UI_AUDIT_LOGS_LOADING_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_AUDIT_LOGS_LOADING_BODY)).toBeInTheDocument()

    rerender(<AuditLogsPanel client={{} as never} />)

    expect(screen.getByText(UI_AUDIT_LOGS_ERROR_TITLE)).toBeInTheDocument()
    expect(screen.getByText(UI_AUDIT_LOGS_ERROR_BODY)).toBeInTheDocument()
  })
})

