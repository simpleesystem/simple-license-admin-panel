import { fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_ENTITLEMENT_ACTION_EDIT,
  UI_ENTITLEMENT_BUTTON_CREATE,
  UI_ENTITLEMENT_EMPTY_STATE_MESSAGE,
  UI_ENTITLEMENT_FORM_SUBMIT_CREATE,
  UI_ENTITLEMENT_FORM_SUBMIT_UPDATE,
} from '../../../src/ui/constants'
import { ProductEntitlementManagementExample } from '../../../src/ui/workflows/ProductEntitlementManagementExample'
import { buildEntitlement } from '../../factories/entitlementFactory'
import { buildUser } from '../../factories/userFactory'
import { buildText } from '../../ui/factories/uiFactories'
import { renderWithProviders } from '../utils'

const useCreateEntitlementMock = vi.hoisted(() => vi.fn())
const useUpdateEntitlementMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useCreateEntitlement: useCreateEntitlementMock,
    useUpdateEntitlement: useUpdateEntitlementMock,
  }
})

vi.mock('../../../src/ui/workflows/ProductEntitlementRowActions', async () => {
  const { UI_ENTITLEMENT_ACTION_EDIT } = await import('../../../src/ui/constants')
  return {
    ProductEntitlementRowActions: ({
      entitlement,
      currentUser,
      onEdit,
      onCompleted,
    }: {
      entitlement: { id: string; vendorId?: string | null }
      currentUser?: { vendorId?: string | null; role?: string } | null
      onEdit: (entitlement: { id: string }) => void
      onCompleted?: () => void
    }) => {
      // Only show edit button if user can update (checks ownership via canUpdateEntitlement)
      const isSystemAdmin = currentUser?.role === 'SUPERUSER' || currentUser?.role === 'ADMIN'
      const ownsEntitlement = isSystemAdmin || (entitlement.vendorId && currentUser?.vendorId === entitlement.vendorId)
      if (!ownsEntitlement) {
        return null
      }
      return (
        <div>
          <button type="button" onClick={() => onEdit(entitlement)}>
            {UI_ENTITLEMENT_ACTION_EDIT}
          </button>
          <button type="button" onClick={() => onCompleted?.()}>
            row-complete-{entitlement.id}
          </button>
        </div>
      )
    },
  }
})

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('ProductEntitlementManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('admin can create entitlement and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const entitlement = buildEntitlement()

    const { getByText, getByRole } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[entitlement]}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_ENTITLEMENT_BUTTON_CREATE))
    await waitFor(() => {
      expect(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    expect(onRefresh).toHaveBeenCalled()
  })

  test('admin can edit entitlement and refreshes data', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const entitlement = buildEntitlement()

    const { getByText, getByRole } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[entitlement]}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_ENTITLEMENT_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_ENTITLEMENT_ACTION_EDIT))
    await waitFor(() => {
      expect(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
    })
    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: entitlement.id,
        data: expect.any(Object),
      })
    )
    expect(onRefresh).toHaveBeenCalled()
  })

  test('vendor manager cannot create but can edit own entitlement', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const vendorId = buildText()
    const entitlement = buildEntitlement({ vendorId })
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId })

    const { queryByText, getByText, getByRole } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[entitlement]}
        currentUser={vendorManager}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(queryByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeNull()

    await waitFor(() => {
      expect(getByText(UI_ENTITLEMENT_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_ENTITLEMENT_ACTION_EDIT))
    await waitFor(() => {
      expect(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
    })
    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_UPDATE }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: entitlement.id,
        data: expect.any(Object),
      })
    )
    expect(onRefresh).toHaveBeenCalled()
  })

  test('vendor manager cannot edit entitlements from other vendors', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const vendorId = buildText()
    const entitlement = buildEntitlement({ vendorId })
    const vendorManager = buildUser({ role: 'VENDOR_MANAGER', vendorId: `${vendorId}-other` })

    const { queryByText } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[entitlement]}
        currentUser={vendorManager}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(queryByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_ENTITLEMENT_ACTION_EDIT)).toBeNull()
  })

  test('vendor-scoped user sees only own entitlements in view-only mode', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const vendorId = 'vendor-entitlements-1'
    const ownEntitlement = buildEntitlement({ vendorId })
    const otherEntitlement = buildEntitlement({ vendorId: 'vendor-entitlements-2' })
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId })

    const { getByText, queryByText } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[ownEntitlement, otherEntitlement]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(ownEntitlement.key)).toBeInTheDocument()
    })
    expect(queryByText(otherEntitlement.key)).toBeNull()
    expect(queryByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_ENTITLEMENT_ACTION_EDIT)).toBeNull()
  })

  test('vendor-scoped user with no own entitlements sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: buildText() })
    const otherEntitlement = buildEntitlement({ vendorId: `${vendorUser.vendorId}-other` })

    const { getByText } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[otherEntitlement]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_ENTITLEMENT_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
    })
  })

  test('viewer cannot see entitlements and sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const entitlement = buildEntitlement()
    const viewer = buildUser({ role: 'VIEWER', vendorId: null })

    const { getByText, queryByText } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[entitlement]}
        currentUser={viewer}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_ENTITLEMENT_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
    })
    expect(queryByText(entitlement.key)).toBeNull()
    expect(queryByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeNull()
    expect(queryByText(UI_ENTITLEMENT_ACTION_EDIT)).toBeNull()
  })

  test('vendor-scoped user with no entitlements sees empty state', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const vendorUser = buildUser({ role: 'VENDOR_ADMIN', vendorId: buildText() })
    const otherEntitlement = buildEntitlement({ vendorId: `${vendorUser.vendorId}-other` })

    const { getByText } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[otherEntitlement]}
        currentUser={vendorUser}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    expect(getByText(UI_ENTITLEMENT_EMPTY_STATE_MESSAGE)).toBeInTheDocument()
  })

  test('does not refresh when create mutation fails', async () => {
    const mutationError = new Error(buildText())
    const createMutation = {
      mutateAsync: vi.fn(async () => {
        throw mutationError
      }),
      isPending: false,
    }
    const updateMutation = mockMutation()
    useCreateEntitlementMock.mockReturnValue(createMutation)
    useUpdateEntitlementMock.mockReturnValue(updateMutation)
    const onRefresh = vi.fn()
    const adminUser = buildUser({ role: 'ADMIN' })
    const entitlement = buildEntitlement()

    const { getByText, getByRole } = renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={buildText()}
        entitlements={[entitlement]}
        currentUser={adminUser}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(getByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(getByText(UI_ENTITLEMENT_BUTTON_CREATE))
    await waitFor(() => {
      expect(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    fireEvent.click(getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
    const mutateCall = createMutation.mutateAsync.mock.results[0]?.value as Promise<unknown>
    await expect(mutateCall).rejects.toThrow(mutationError)
    expect(onRefresh).not.toHaveBeenCalled()
  })
})
