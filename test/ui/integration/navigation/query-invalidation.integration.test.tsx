import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_BUTTON_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_BUTTON_EDIT,
  UI_PRODUCT_TIER_BUTTON_CREATE,
} from '../../../../src/ui/constants'
import { AppShell } from '../../../../src/ui/layout/AppShell'
import { SidebarNav } from '../../../../src/ui/navigation/SidebarNav'
import { LicenseManagementExample } from '../../../../src/ui/workflows/LicenseManagementExample'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { ProductTierManagementExample } from '../../../../src/ui/workflows/ProductTierManagementExample'
import { buildLicense } from '../../../factories/licenseFactory'
import { buildProduct } from '../../../factories/productFactory'
import { buildProductTier } from '../../../factories/productTierFactory'
import { renderWithProviders } from '../../utils'

const useCreateProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())
const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())
const useCreateProductTierMock = vi.hoisted(() => vi.fn())
const useUpdateProductTierMock = vi.hoisted(() => vi.fn())
const useDeleteProductTierMock = vi.hoisted(() => vi.fn())
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

const createNavItems = (onSelect: (id: 'products' | 'tiers' | 'licenses') => void) => [
  { id: 'products', label: 'Products', onClick: () => onSelect('products') },
  { id: 'tiers', label: 'Tiers', onClick: () => onSelect('tiers') },
  { id: 'licenses', label: 'Licenses', onClick: () => onSelect('licenses') },
]

const ScreenHost = ({ vendorId }: { vendorId: string }) => {
  const [active, setActive] = useState<'products' | 'tiers' | 'licenses'>('products')
  const items = createNavItems(setActive)
  const product = buildProduct({ vendorId, status: 'ACTIVE' })
  const tier = buildProductTier({ vendorId, productId: product.id })
  const license = buildLicense({ vendorId, status: 'ACTIVE' })

  return (
    <AppShell sidebar={<SidebarNav items={items} />} topBar={null}>
      {active === 'products' ? (
        <ProductManagementExample
          client={{} as never}
          products={[product]}
          currentUser={{ role: 'SUPERUSER', vendorId }}
          onRefresh={vi.fn()}
        />
      ) : null}
      {active === 'tiers' ? (
        <ProductTierManagementExample
          client={{} as never}
          productId={product.id}
          tiers={[tier]}
          currentUser={{ role: 'SUPERUSER', vendorId }}
          onRefresh={vi.fn()}
        />
      ) : null}
      {active === 'licenses' ? (
        <LicenseManagementExample
          client={{} as never}
          licenseId={license.id}
          licenseVendorId={license.vendorId}
          licenseStatus={license.status}
          tierOptions={[]}
          productOptions={[]}
          currentUser={{ role: 'SUPERUSER', vendorId }}
          onRefresh={vi.fn()}
        />
      ) : null}
    </AppShell>
  )
}

describe('Mutation to navigation refetch smoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCreateProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())
    useCreateProductTierMock.mockReturnValue(mockMutation())
    useUpdateProductTierMock.mockReturnValue(mockMutation())
    useDeleteProductTierMock.mockReturnValue(mockMutation())
    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
  })

  test('after product mutation, subsequent navs still show edit actions (implying fresh data)', async () => {
    const vendorId = 'vendor-1'
    renderWithProviders(<ScreenHost vendorId={vendorId} />)

    // Products first
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    await waitFor(() => {
      expect(useCreateProductMock().mutateAsync).toHaveBeenCalled()
    })

    // Navigate to tiers
    fireEvent.click(screen.getByText('Tiers'))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE)).toBeInTheDocument()
    })

    // Navigate to licenses
    fireEvent.click(screen.getByText('Licenses'))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_EDIT)).toBeInTheDocument()
    })

    // Navigate back to products
    fireEvent.click(screen.getByText('Products'))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_BUTTON_EDIT)).toBeInTheDocument()
    })
  })
})
