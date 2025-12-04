import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, beforeEach, test, vi } from 'vitest'

import {
  UI_TENANT_ACTION_EDIT,
  UI_TENANT_ACTION_RESUME,
  UI_TENANT_ACTION_SUSPEND,
} from '../../../src/ui/constants'
import { TenantRowActions } from '../../../src/ui/workflows/TenantRowActions'
import { buildTenant } from '../../factories/tenantFactory'
import { buildUser } from '../../factories/userFactory'

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
  ActionMenu: ({ items }: { items: Array<{ id: string; label: string; disabled?: boolean; onSelect: () => void }> }) => (
    <div>
      {items.map((item) => (
        <button key={item.id} onClick={item.onSelect} disabled={item.disabled}>
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

  test('superuser can edit and suspend/resume', async () => {
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSuspendTenantMock.mockReturnValue(suspendMutation)
    useResumeTenantMock.mockReturnValue(resumeMutation)
    const onEdit = vi.fn()
    const tenant = buildTenant({ status: 'ACTIVE' })
    const superuser = buildUser({ role: 'SUPERUSER' })

    const { rerender } = render(
      <TenantRowActions client={{} as never} tenant={tenant as never} onEdit={onEdit} currentUser={superuser} />,
    )

    fireEvent.click(screen.getByText(UI_TENANT_ACTION_EDIT))
    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(tenant))

    fireEvent.click(screen.getByText(UI_TENANT_ACTION_SUSPEND))
    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(tenant.id))

    const suspendedTenant = { ...tenant, status: 'SUSPENDED' as const }
    rerender(
      <TenantRowActions
        client={{} as never}
        tenant={suspendedTenant as never}
        onEdit={onEdit}
        currentUser={superuser}
      />,
    )

    fireEvent.click(screen.getByText(UI_TENANT_ACTION_RESUME))
    await waitFor(() => expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(suspendedTenant.id))
  })

  test('vendor manager can edit own tenant but not suspend/resume others', async () => {
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSuspendTenantMock.mockReturnValue(suspendMutation)
    useResumeTenantMock.mockReturnValue(resumeMutation)
    const vendorId = buildTenant().vendorId
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId })
    const tenant = buildTenant({ vendorId })

    render(
      <TenantRowActions
        client={{} as never}
        tenant={tenant as never}
        onEdit={vi.fn()}
        currentUser={vendorManager}
      />,
    )

    expect(screen.getByText(UI_TENANT_ACTION_EDIT)).toBeEnabled()
    fireEvent.click(screen.getByText(UI_TENANT_ACTION_SUSPEND))
    await waitFor(() => expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(tenant.id))
  })

  test('vendor manager cannot edit or suspend tenants from other vendors', async () => {
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSuspendTenantMock.mockReturnValue(suspendMutation)
    useResumeTenantMock.mockReturnValue(resumeMutation)
    const tenant = buildTenant()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${tenant.vendorId}-other` })

    render(
      <TenantRowActions
        client={{} as never}
        tenant={tenant as never}
        onEdit={vi.fn()}
        currentUser={vendorManager}
      />,
    )

    expect(screen.queryByText(UI_TENANT_ACTION_EDIT)).toBeNull()
    expect(screen.queryByText(UI_TENANT_ACTION_SUSPEND)).toBeNull()
    expect(screen.queryByText(UI_TENANT_ACTION_RESUME)).toBeNull()
  })

  test('vendor-scoped viewer sees no actions', async () => {
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    useSuspendTenantMock.mockReturnValue(suspendMutation)
    useResumeTenantMock.mockReturnValue(resumeMutation)
    const tenant = buildTenant()
    const viewer = buildUser({ role: 'VIEWER', vendorId: tenant.vendorId })

    render(
      <TenantRowActions
        client={{} as never}
        tenant={tenant as never}
        onEdit={vi.fn()}
        currentUser={viewer}
      />,
    )

    expect(screen.queryByText(UI_TENANT_ACTION_EDIT)).toBeNull()
    expect(screen.queryByText(UI_TENANT_ACTION_SUSPEND)).toBeNull()
    expect(screen.queryByText(UI_TENANT_ACTION_RESUME)).toBeNull()
  })
})


