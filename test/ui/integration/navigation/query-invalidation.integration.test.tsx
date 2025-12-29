import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import '@testing-library/jest-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_ACTION_EDIT,
  UI_PRODUCT_ACTION_EDIT,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_FORM_SUBMIT_CREATE,
  UI_PRODUCT_TIER_BUTTON_CREATE,
} from '../../../../src/ui/constants'
import { AppShell } from '../../../../src/ui/layout/AppShell'
import { SidebarNav } from '../../../../src/ui/navigation/SidebarNav'
import { LicenseRowActions } from '../../../../src/ui/workflows/LicenseRowActions'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { ProductTierManagementExample } from '../../../../src/ui/workflows/ProductTierManagementExample'
import { buildLicense } from '../../../factories/licenseFactory'
import { buildProduct } from '../../../factories/productFactory'
import { buildProductTier } from '../../../factories/productTierFactory'
import { buildUser } from '../../../factories/userFactory'
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
  const product = buildProduct({ vendorId, isActive: true })
  const tier = buildProductTier({ productId: product.id, isActive: true })
  const license = buildLicense({ productId: product.id, productSlug: product.slug, status: 'ACTIVE' })
  const currentUser = buildUser({ role: 'SUPERUSER', vendorId })

  return (
    <AppShell sidebar={<SidebarNav items={items} />} topBar={null}>
      {active === 'products' ? (
        <ProductManagementExample
          client={{} as never}
          products={[product]}
          currentUser={currentUser}
          onRefresh={vi.fn()}
          page={1}
          totalPages={1}
          onPageChange={vi.fn()}
        />
      ) : null}
      {active === 'tiers' ? (
        <ProductTierManagementExample
          client={{} as never}
          productId={product.id}
          tiers={[tier]}
          currentUser={currentUser}
          onRefresh={vi.fn()}
          page={1}
          totalPages={1}
          onPageChange={vi.fn()}
        />
      ) : null}
      {active === 'licenses' ? (
        <LicenseRowActions
          client={{} as never}
          licenseKey={license.licenseKey ?? license.id}
          licenseVendorId={product.vendorId ?? null}
          licenseStatus={license.status}
          currentUser={currentUser}
          onEdit={vi.fn()}
          onCompleted={vi.fn()}
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
    const createProductMutation = mockMutation()
    useCreateProductMock.mockReturnValue(createProductMutation)
    renderWithProviders(<ScreenHost vendorId={vendorId} />)

    // Products first
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_BUTTON_CREATE)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText(UI_PRODUCT_BUTTON_CREATE))
    const newProduct = buildProduct({ vendorId })
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: newProduct.name } })
    fireEvent.change(screen.getByLabelText(/slug/i), { target: { value: newProduct.slug } })
    fireEvent.click(screen.getByRole('button', { name: UI_PRODUCT_FORM_SUBMIT_CREATE }))
    await waitFor(() => {
      expect(createProductMutation.mutateAsync).toHaveBeenCalled()
    })

    // Navigate to tiers
    fireEvent.click(screen.getByText('Tiers'))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_TIER_BUTTON_CREATE)).toBeInTheDocument()
    })

    // Navigate to licenses
    fireEvent.click(screen.getByText('Licenses'))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_ACTION_EDIT)).toBeInTheDocument()
    })

    // Navigate back to products
    fireEvent.click(screen.getByText('Products'))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_ACTION_EDIT)).toBeInTheDocument()
    })
  })
})
