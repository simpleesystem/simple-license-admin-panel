import { describe, expect, it } from 'vitest'

import { formatTenantCreatedAt } from '@/ui/utils/formatUtils'
import { UI_VALUE_PLACEHOLDER } from '@/ui/constants'

describe('formatTenantCreatedAt', () => {
  it('returns the placeholder when the date is missing', () => {
    expect(formatTenantCreatedAt(undefined)).toBe(UI_VALUE_PLACEHOLDER)
  })

  it('formats valid ISO date strings', () => {
    const date = new Date('2023-01-02T00:00:00Z').toISOString()
    expect(formatTenantCreatedAt(date)).toContain('2023')
  })
})
import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_TENANT_ACTION_EDIT,
  UI_TENANT_BUTTON_CREATE,
  UI_TENANT_EMPTY_STATE_MESSAGE,
  UI_TENANT_FORM_SUBMIT_CREATE,
  UI_TENANT_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import { TenantManagementExample } from '../../../src/ui/workflows/TenantManagementExample'
import { buildTenant } from '../../factories/tenantFactory'
import { buildUser } from '../../factories/userFactory'

const useCreateTenantMock = vi.hoisted(() => vi.fn())
const useUpdateTenantMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useCreateTenant: useCreateTenantMock,
    useUpdateTenant: useUpdateTenantMock,
  }
})

vi.mock('../../../src/ui/workflows/TenantRowActions', () => ({
  TenantRowActions: ({ tenant, onEdit, onCompleted }: { tenant: { id: string }; onEdit: (t: unknown) => void; onCompleted?: () => void }) => (
    <div>
      <button type="button" onClick={() => onEdit(tenant)}>
        {UI_TENANT_ACTION_EDIT}
      </button>
      <button type="button" onClick={() => onCompleted?.()}>
        suspend-resume
      </button>
    </div>
  ),
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('TenantManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('admin can create tenant and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const tenants = [buildTenant()]

    const { getByText, getByRole } = render(
      <TenantManagementExample
        client={{} as never}
        tenants={tenants}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    )

    fireEvent.click(getByText(UI_TENANT_BUTTON_CREATE))
    fireEvent.click(getByRole('button', { name: UI_TENANT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onRefresh).toHaveBeenCalled()
  })

  test('admin can edit any tenant and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const tenant = buildTenant()

    const { getByText, getByRole } = render(
      <TenantManagementExample
        client={{} as never}
        tenants={[tenant]}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    )

    fireEvent.click(getByText(UI_TENANT_ACTION_EDIT))
    fireEvent.click(getByRole('button', { name: UI_TENANT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tenant.id,
        data: expect.any(Object),
      }),
    )
    expect(onRefresh).toHaveBeenCalled()
  })

  test('vendor manager cannot create but can edit own tenant', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const vendorId = buildTenant().vendorId
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId })
    const tenant = buildTenant({ vendorId })

    const { queryByText, getByText, getByRole } = render(
      <TenantManagementExample
        client={{} as never}
        tenants={[tenant]}
        currentUser={vendorManager}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(queryByText(UI_TENANT_BUTTON_CREATE)).toBeNull()

    fireEvent.click(getByText(UI_TENANT_ACTION_EDIT))
    fireEvent.click(getByRole('button', { name: UI_TENANT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: tenant.id,
        data: expect.any(Object),
      }),
    )
    expect(onRefresh).toHaveBeenCalled()
  })

  test('vendor manager cannot edit tenants from other vendors', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const tenant = buildTenant()
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${tenant.vendorId}-different` })

    const { queryByText } = render(
      <TenantManagementExample
        client={{} as never}
        tenants={[tenant]}
        currentUser={vendorManager}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(queryByText(UI_TENANT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_TENANT_ACTION_EDIT)).toBeNull()
  })

  test('vendor scoped user sees only their tenants in view-only mode', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const vendorId = buildTenant().vendorId
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId })
    const ownTenant = buildTenant({ vendorId })
    const otherTenant = buildTenant({ vendorId: 'other-vendor' })

    const { getByText, queryByText } = render(
      <TenantManagementExample
        client={{} as never}
        tenants={[ownTenant, otherTenant]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(getByText(ownTenant.name)).toBeInTheDocument()
    expect(queryByText(otherTenant.name)).toBeNull()
    expect(queryByText(UI_TENANT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_TENANT_ACTION_EDIT)).toBeNull()
  })

  test('vendor scoped user with no tenants sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)
    const vendorId = buildTenant().vendorId
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId })
    const otherTenant = buildTenant({ vendorId: `${vendorId}-other` })

    const { getByText } = render(
      <TenantManagementExample
        client={{} as never}
        tenants={[otherTenant]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    )

    expect(getByText(UI_TENANT_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
  })
})
