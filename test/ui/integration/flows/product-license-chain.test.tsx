import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_ENTITLEMENT_ACTION_DELETE,
  UI_ENTITLEMENT_BUTTON_CREATE,
  UI_LICENSE_ACTION_DELETE,
  UI_LICENSE_ACTION_RESUME,
  UI_LICENSE_ACTION_SUSPEND,
  UI_LICENSE_BUTTON_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_TIER_ACTION_DELETE,
  UI_PRODUCT_TIER_BUTTON_CREATE,
} from '../../../../src/ui/constants'
import { ProductEntitlementManagementExample } from '../../../../src/ui/workflows/ProductEntitlementManagementExample'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { ProductTierManagementExample } from '../../../../src/ui/workflows/ProductTierManagementExample'
import { LicenseManagementExample } from '../../../../src/ui/workflows/LicenseManagementExample'
import { buildProduct } from '../../factories/productFactory'
import { renderWithProviders, buildProductChain } from '../../utils'

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

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
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

    // Product management
    renderWithProviders(
      <ProductManagementExample
        client={{} as never}
        products={[buildProduct({ vendorId: chain.vendorId })]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    await waitFor(() => {
      expect(useCreateProductMock().mutateAsync).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_EDIT))
    await waitFor(() => {
      expect(useUpdateProductMock().mutateAsync).toHaveBeenCalled()
    })

    // Tier management
    renderWithProviders(
      <ProductTierManagementExample
        client={{} as never}
        productId={chain.product.id}
        tiers={[chain.tier]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE))
    await waitFor(() => {
      expect(useCreateProductTierMock().mutateAsync).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByText(UI_PRODUCT_TIER_ACTION_DELETE))
    await waitFor(() => {
      expect(useDeleteProductTierMock().mutateAsync).toHaveBeenCalledWith(chain.tier.id)
    })

    // Entitlement management
    renderWithProviders(
      <ProductEntitlementManagementExample
        client={{} as never}
        productId={chain.product.id}
        entitlements={[chain.entitlement]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByText(UI_ENTITLEMENT_BUTTON_CREATE))
    await waitFor(() => {
      expect(useCreateEntitlementMock().mutateAsync).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByText(UI_ENTITLEMENT_ACTION_DELETE))
    await waitFor(() => {
      expect(useDeleteEntitlementMock().mutateAsync).toHaveBeenCalledWith(chain.entitlement.id)
    })

    // License management
    renderWithProviders(
      <LicenseManagementExample
        client={{} as never}
        licenseId={chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="ACTIVE"
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'SUPERUSER', vendorId: chain.vendorId }}
        onRefresh={onRefresh}
      />,
    )

    fireEvent.click(screen.getByText(UI_LICENSE_BUTTON_EDIT))
    await waitFor(() => {
      expect(useUpdateLicenseMock().mutateAsync).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_SUSPEND))
    await waitFor(() => {
      expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(chain.license.id)
    })

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_RESUME))
    await waitFor(() => {
      expect(resumeMutation.mutateAsync).toHaveBeenCalledWith(chain.license.id)
    })

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_DELETE))
    await waitFor(() => {
      expect(revokeMutation.mutateAsync).toHaveBeenCalledWith(chain.license.id)
    })

    expect(onRefresh).toHaveBeenCalled()
  })

  test('VENDOR_MANAGER limited to own vendor and cannot delete license', () => {
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
      <LicenseManagementExample
        client={{} as never}
        licenseId={chain.license.id}
        licenseVendorId={chain.vendorId}
        licenseStatus="ACTIVE"
        tierOptions={[]}
        productOptions={[]}
        currentUser={{ role: 'VENDOR_MANAGER', vendorId: chain.vendorId }}
        onRefresh={vi.fn()}
      />,
    )

    expect(screen.queryByText(UI_LICENSE_ACTION_DELETE)).toBeNull()

    fireEvent.click(screen.getByText(UI_LICENSE_ACTION_SUSPEND))
    expect(suspendMutation.mutateAsync).toHaveBeenCalledWith(chain.license.id)
  })
})

