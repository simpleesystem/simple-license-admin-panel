import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_ENTITLEMENT_ACTION_DELETE,
  UI_ENTITLEMENT_BUTTON_CREATE,
  UI_ENTITLEMENT_FORM_SUBMIT_CREATE,
  UI_LICENSE_ACTION_EDIT,
  UI_LICENSE_BUTTON_DELETE,
  UI_LICENSE_BUTTON_RESUME,
  UI_LICENSE_BUTTON_SUSPEND,
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
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

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

describe('Product → Tier → Entitlement → License chain', () => {
  test('SUPERUSER happy path with refresh callbacks and suspends/resumes license', async () => {
    const chain = buildProductChain()
    const onRefresh = vi.fn()
    const createProductMutation = mockMutation()
    const updateProductMutation = mockMutation()
    const deleteProductTierMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createProductMutation)
    useUpdateProductMock.mockReturnValue(updateProductMutation)
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())

    useCreateProductTierMock.mockReturnValue(mockMutation())
    useUpdateProductTierMock.mockReturnValue(mockMutation())
    useDeleteProductTierMock.mockReturnValue(deleteProductTierMutation)

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

    // Product management
    renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[buildProduct({ vendorId: chain.vendorId, isActive: true })]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: chain.product.name } })
    fireEvent.change(screen.getByLabelText(/Slug/i), { target: { value: chain.product.slug } })
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(createProductMutation.mutateAsync).toHaveBeenCalled())

    fireEvent.click(screen.getByText(UI_PRODUCT_ACTION_EDIT))
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_UPDATE }))
    await waitFor(() => expect(updateProductMutation.mutateAsync).toHaveBeenCalled())

    // Tier management
    renderWithProviders(
      <ProductTierManagementExample
        client={{} as never}
        productId={chain.product.id}
        tiers={[chain.tier]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE))
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_TIER_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(useCreateProductTierMock().mutateAsync).toHaveBeenCalled())

    const tierRow = screen.getByText(chain.tier.tierName).closest('tr')
    expect(tierRow).not.toBeNull()
    const tierActionMenu = within(tierRow as HTMLElement).getByTestId('ui-action-menu')
    const tierActionToggle = within(tierActionMenu).getByTestId('ui-action-menu-toggle')
    await act(async () => {
      fireEvent.click(tierActionToggle)
    })
    const [, tierDeleteButton] = within(tierActionMenu).getAllByText(UI_PRODUCT_TIER_ACTION_DELETE)
    fireEvent.click(tierDeleteButton)
    await waitFor(() => {
      expect(deleteProductTierMutation.mutateAsync).toHaveBeenCalledWith(chain.tier.id)
    })

    // Entitlement management
    renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={chain.product.id}
        entitlements={[chain.entitlement]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
        page={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText(UI_ENTITLEMENT_BUTTON_CREATE))
    fireEvent.click(screen.getByRole('button', { name: UI_ENTITLEMENT_FORM_SUBMIT_CREATE }))
    await waitFor(() => expect(useCreateEntitlementMock().mutateAsync).toHaveBeenCalled())

    const entitlementRow = screen.getByText(chain.entitlement.key).closest('tr')
    expect(entitlementRow).not.toBeNull()
    const entitlementActionMenu = within(entitlementRow as HTMLElement).getByTestId('ui-action-menu')
    const entitlementActionToggle = within(entitlementActionMenu).getByTestId('ui-action-menu-toggle')
    await act(async () => {
      fireEvent.click(entitlementActionToggle)
    })
    const [, entitlementDeleteButton] = within(entitlementActionMenu).getAllByText(UI_ENTITLEMENT_ACTION_DELETE)
    fireEvent.click(entitlementDeleteButton)
    await waitFor(() => {
      expect(useDeleteEntitlementMock().mutateAsync).toHaveBeenCalledWith(chain.entitlement.id)
    })

    // License management
    const onEditLicense = vi.fn()
    const { rerender: rerenderLicense } = renderWithProviders(
      <LicenseRowActions
        client={{} as never}
        licenseKey={chain.license.licenseKey ?? chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="ACTIVE"
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onEdit={onEditLicense}
        onCompleted={onRefresh}
      />
    )

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_EDIT))
    expect(onEditLicense).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_SUSPEND))
    await waitFor(() => {
      expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })

    rerenderLicense(
      <LicenseRowActions
        client={{} as never}
        licenseKey={chain.license.licenseKey ?? chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="SUSPENDED"
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onEdit={onEditLicense}
        onCompleted={onRefresh}
      />
    )

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_RESUME))
    await waitFor(() => {
      expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_DELETE))
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
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: chain.vendorId }}
        onCompleted={vi.fn()}
      />
    )

    expect(screen.queryByText(UI_LICENSE_BUTTON_DELETE)).toBeNull()

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_SUSPEND))
    await waitFor(() => {
      expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(chain.license.licenseKey ?? chain.license.id)
    })
  })
})
