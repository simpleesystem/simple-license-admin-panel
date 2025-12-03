import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import { TenantRowActions } from '../../../src/ui/workflows/TenantRowActions'

const useSuspendTenantMock = vi.hoisted(() => vi.fn())
const useResumeTenantMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useSuspendTenant: useSuspendTenantMock,
    useResumeTenant: useResumeTenantMock,
  }
})

vi.mock('../../../src/ui/data/ActionMenu', () => ({
  ActionMenu: ({ items }: { items: Array<{ id: string; label: string; onSelect: () => void }> }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('TenantRowActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const tenant = {
    id: 'tenant-1',
    name: 'Tenant One',
    status: 'ACTIVE' as const,
  }

  test('calls onEdit when edit action triggered', async () => {
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSuspendTenantMock.mockReturnValue(suspendMutation)
    useResumeTenantMock.mockReturnValue(resumeMutation)
    const onEdit = vi.fn()

    render(
      <TenantRowActions
        client={{} as never}
        tenant={tenant as never}
        onEdit={onEdit}
      />,
    )

    fireEvent.click(screen.getByText('Edit Tenant'))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(tenant))
  })

  test('runs suspend/resume mutations', async () => {
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSuspendTenantMock.mockReturnValue(suspendMutation)
    useResumeTenantMock.mockReturnValue(resumeMutation)

    const { rerender } = render(
      <TenantRowActions
        client={{} as never}
        tenant={tenant as never}
        onEdit={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText('Suspend Tenant'))
    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(tenant.id))

    const suspendedTenant = { ...tenant, status: 'SUSPENDED' as const }
    rerender(<TenantRowActions client={{} as never} tenant={suspendedTenant as never} onEdit={vi.fn()} />)

    fireEvent.click(screen.getByText('Resume Tenant'))
    await waitFor(() => expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(suspendedTenant.id))
  })
})


