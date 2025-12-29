import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_ENTITLEMENT_ACTION_DELETE,
  UI_ENTITLEMENT_BUTTON_CREATE,
  UI_ENTITLEMENT_FORM_SUBMIT_CREATE,
  UI_LICENSE_ACTION_EDIT,
  UI_LICENSE_BUTTON_DELETE,
  UI_LICENSE_BUTTON_RESUME,
  UI_LICENSE_BUTTON_SUSPEND,
  UI_LICENSE_CONFIRM_DELETE_CONFIRM,
  UI_LICENSE_CONFIRM_RESUME_CONFIRM,
  UI_LICENSE_CONFIRM_SUSPEND_CONFIRM,
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CONFIRM,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_FORM_SUBMIT_UPDATE,
  UI_PRODUCT_TIER_ACTION_DELETE,
  UI_PRODUCT_TIER_BUTTON_CREATE,
  UI_PRODUCT_TIER_FORM_SUBMIT_CREATE,
} from '../../../../src/ui/constants'
import { LicenseRowActions } from '../../../../src/ui/workflows/LicenseRowActions'
import { ProductEntitlementManagementExample } from '../../../../src/ui/workflows/ProductEntitlementManagementExample'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { ProductTierManagementExample } from '../../../../src/ui/workflows/ProductTierManagementExample'
import { buildProduct } from '../../../factories/productFactory'
import { buildUser } from '../../../factories/userFactory'
import { buildProductChain, renderWithProviders } from '../../utils'

const useCreateProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())
const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())

const useCreateProductTierMock = vi.hoisted(() => vi.fn())
const useUpdateProductTierMock = vi.hoisted(() => vi.fn())
const useDeleteProductTierMock = vi.hoisted(() => vi.fn())

const useCreateEntitlementMock = vi.hoisted(() => vi.fn())
const useUpdateEntitlementMock = vi.hoisted(() => vi.fn())
const useDeleteEntitlementMock = vi.hoisted(() => vi.fn())

const useCreateLicenseMock = vi.hoisted(() => vi.fn())
const useUpdateLicenseMock = vi.hoisted(() => vi.fn())
const useRevokeLicenseMock = vi.hoisted(() => vi.fn())
const useSuspendLicenseMock = vi.hoisted(() => vi.fn())
const useResumeLicenseMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense')>('@/simpleLicense')
  return {
    ...actual,
    useCreateProduct: useCreateProductMock,
    useUpdateProduct: useUpdateProductMock,
    useDeleteProduct: useDeleteProductMock,
    useSuspendProduct: useSuspendProductMock,
    useResumeProduct: useResumeProductMock,
    useCreateProductTier: useCreateProductTierMock,
    useUpdateProductTier: useUpdateProductTierMock,
    useDeleteProductTier: useDeleteProductTierMock,
    useCreateEntitlement: useCreateEntitlementMock,
    useUpdateEntitlement: useUpdateEntitlementMock,
    useDeleteEntitlement: useDeleteEntitlementMock,
    useCreateLicense: useCreateLicenseMock,
    useUpdateLicense: useUpdateLicenseMock,
    useRevokeLicense: useRevokeLicenseMock,
    useSuspendLicense: useSuspendLicenseMock,
    useResumeLicense: useResumeLicenseMock,
  }
})

const mockMutation = (id?: string) => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
  _id: id || 'default',
})

describe('Product → Tier → Entitlement → License chain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('SUPERUSER happy path with refresh callbacks and suspends/resumes license', async () => {
    const chain = buildProductChain()
    const onRefresh = vi.fn()
    const createProductMutation = mockMutation()
    const updateProductMutation = mockMutation()
    const softDeleteProductTierMutation = mockMutation()
    const createProductTierMutation = mockMutation()
    const createEntitlementMutation = mockMutation()
    const deleteEntitlementMutation = mockMutation()

    useCreateProductMock.mockReturnValue(createProductMutation)
    useUpdateProductMock.mockReturnValue(updateProductMutation)
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())

    useCreateProductTierMock.mockReturnValue(createProductTierMutation)
    useUpdateProductTierMock.mockReturnValue(softDeleteProductTierMutation)
    useDeleteProductTierMock.mockReturnValue(mockMutation())

    useCreateEntitlementMock.mockReturnValue(createEntitlementMutation)
    useUpdateEntitlementMock.mockReturnValue(mockMutation())
    useDeleteEntitlementMock.mockReturnValue(deleteEntitlementMutation)

    const revokeMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    const updateLicenseMutation = mockMutation()
    const createLicenseMutation = mockMutation()

    useRevokeLicenseMock.mockReturnValue(revokeMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)
    useUpdateLicenseMock.mockReturnValue(updateLicenseMutation)
    useCreateLicenseMock.mockReturnValue(createLicenseMutation)

    // Product management
    const mockClient = {
      getProduct: vi.fn().mockResolvedValue(chain.product),
      listProductTiers: vi.fn().mockResolvedValue([]),
      listEntitlements: vi.fn().mockResolvedValue([]),
    }
    renderWithProviders(
      <ProductManagementExample
        client={mockClient as never}
        products={[buildProduct({ vendorId: chain.vendorId, isActive: true })]}
        currentUser={buildUser({ role: 'SUPERUSER', vendorId: chain.vendorId })}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
    })
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: chain.product.name } })
    fireEvent.change(screen.getByLabelText(/Slug/i), { target: { value: chain.product.slug } })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(createProductMutation.mutateAsync).toHaveBeenCalled())

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_EDIT))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE }))
    await waitFor(() => expect(updateProductMutation.mutateAsync).toHaveBeenCalled())

    // Tier management - test create through panel
    const { unmount: unmountTierPanel } = renderWithProviders(
      <ProductTierManagementExample
        client={{} as never}
        productId={chain.product.id}
        tiers={[chain.tier]}
        currentUser={buildUser({ role: 'SUPERUSER', vendorId: chain.vendorId })}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(createProductTierMutation.mutateAsync).toHaveBeenCalled())

    // Unmount panel and test delete tier action directly with ProductTierRowActions
    // This avoids issues with the panel wrapper and ensures the mutation is called correctly
    unmountTierPanel()

    // Set up the mock fresh right before testing delete (like the working test pattern)
    // Create a fresh mutation instance to avoid any caching issues
    const deleteTierMutation = mockMutation('DELETE_TIER_MUTATION')
    // Reset the mock completely to ensure clean state, then set it up BEFORE rendering
    useUpdateProductTierMock.mockReset()
    useUpdateProductTierMock.mockReturnValue(deleteTierMutation)

    // Render the component - useUpdateProductTier will be called during render
    // Hooks are now called before early return, so the hook should be invoked
    const { ProductTierRowActions } = await import('../../../../src/ui/workflows/ProductTierRowActions')
    const { unmount: unmountRowActions } = renderWithProviders(
      <ProductTierRowActions
        client={{} as never}
        tier={chain.tier as never}
        onEdit={vi.fn()}
        onCompleted={onRefresh}
        currentUser={buildUser({ role: 'SUPERUSER', vendorId: chain.vendorId })}
        vendorId={chain.tier.vendorId}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_TIER_ACTION_DELETE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_DELETE))

    const dialog = await screen.findByRole('dialog')
    const confirmButton = within(dialog).getByRole('button', { name: /Delete tier/i })
    // Verify button is not disabled before clicking
    expect(confirmButton).not.toBeDisabled()
    fireEvent.click(confirmButton)

    // Wait for the mutation to be called - soft delete uses updateProductTier with is_active: false
    await waitFor(
      () => {
        expect(deleteTierMutation.mutateAsync).toHaveBeenCalledWith({
          id: chain.tier.id,
          data: { is_active: false },
        })
      },
      { timeout: 5000 }
    )

    unmountRowActions()

    // Entitlement management
    renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={chain.product.id}
        entitlements={[chain.entitlement]}
        currentUser={buildUser({ role: 'SUPERUSER', vendorId: chain.vendorId })}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_ENTITLEMENT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_ENTITLEMENT_BUTTON_CREATE))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(createEntitlementMutation.mutateAsync).toHaveBeenCalled())

    await waitFor(() => {
      expect(screen.getByText(chain.entitlement.key)).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText(UI_ENTITLEMENT_ACTION_DELETE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_ENTITLEMENT_ACTION_DELETE))

    const entitlementDialog = await screen.findByRole('dialog')
    const confirmEntitlementButton = within(entitlementDialog).getByRole('button', {
      name: UI_PRODUCT_ENTITLEMENT_CONFIRM_DELETE_CONFIRM,
    })
    fireEvent.click(confirmEntitlementButton)

    await waitFor(() => {
      expect(deleteEntitlementMutation.mutateAsync).toHaveBeenCalledWith(chain.entitlement.id)
    })

    // License management
    const onEditLicense = vi.fn()
    const { rerender: rerenderLicense } = renderWithProviders(
      <LicenseRowActions
        client={{} as never}
        licenseKey={chain.license.licenseKey ?? chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="ACTIVE"
        currentUser={buildUser({ role: 'SUPERUSER', vendorId: chain.vendorId })}
        onEdit={onEditLicense}
        onCompleted={onRefresh}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_ACTION_EDIT)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_EDIT))
    expect(onEditLicense).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_SUSPEND)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_SUSPEND))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_SUSPEND_CONFIRM })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_SUSPEND_CONFIRM }))
    await waitFor(() => {
      expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })

    rerenderLicense(
      <LicenseRowActions
        client={{} as never}
        licenseKey={chain.license.licenseKey ?? chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="SUSPENDED"
        currentUser={buildUser({ role: 'SUPERUSER', vendorId: chain.vendorId })}
        onEdit={onEditLicense}
        onCompleted={onRefresh}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_RESUME)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_RESUME))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_RESUME_CONFIRM })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_RESUME_CONFIRM }))
    await waitFor(() => {
      expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_DELETE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_DELETE))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_DELETE_CONFIRM })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_DELETE_CONFIRM }))
    await waitFor(() => {
      expect(revokeMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })

    expect(onRefresh).toHaveBeenCalled()
  })

  test('VENDOR_MANAGER limited to own vendor and cannot delete license', async () => {
    const chain = buildProductChain()
    useCreateProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())

    useCreateProductTierMock.mockReturnValue(mockMutation())
    useUpdateProductTierMock.mockReturnValue(mockMutation())
    useDeleteProductTierMock.mockReturnValue(mockMutation())

    useCreateEntitlementMock.mockReturnValue(mockMutation())
    useUpdateEntitlementMock.mockReturnValue(mockMutation())
    useDeleteEntitlementMock.mockReturnValue(mockMutation())

    const revokeMutation = mockMutation()
    const suspendMutation = mockMutation()
    const resumeMutation = mockMutation()
    const updateLicenseMutation = mockMutation()
    const createLicenseMutation = mockMutation()

    useRevokeLicenseMock.mockReturnValue(revokeMutation)
    useSuspendLicenseMock.mockReturnValue(suspendMutation)
    useResumeLicenseMock.mockReturnValue(resumeMutation)
    useUpdateLicenseMock.mockReturnValue(updateLicenseMutation)
    useCreateLicenseMock.mockReturnValue(createLicenseMutation)

    renderWithProviders(
      <LicenseRowActions
        client={{} as never}
        licenseKey={chain.license.licenseKey ?? chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="ACTIVE"
        currentUser={buildUser({ role: 'VENDOR_MANAGER', vendorId: chain.vendorId })}
        onEdit={vi.fn()}
        onCompleted={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText(UI_LICENSE_BUTTON_DELETE)).toBeNull()
    })

    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_SUSPEND)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_SUSPEND))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_SUSPEND_CONFIRM })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: UI_LICENSE_CONFIRM_SUSPEND_CONFIRM }))
    await waitFor(() => {
      expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })
  })
})
