import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_BUTTON_EDIT,
  UI_LICENSE_ACTION_DELETE,
  UI_PRODUCT_BUTTON_CREATE,
  UI_PRODUCT_BUTTON_EDIT,
} from '../../../../src/ui/constants'
import { AppShell } from '../../../../src/ui/layout/AppShell'
import { SidebarNav } from '../../../../src/ui/navigation/SidebarNav'
import { LicenseManagementExample } from '../../../../src/ui/workflows/LicenseManagementExample'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { buildLicense } from '../../../factories/licenseFactory'
import { buildProduct } from '../../../factories/productFactory'
import { renderWithProviders } from '../../utils'

const useCreateProductMock = vi.hoisted(() => vi.fn())
const useUpdateProductMock = vi.hoisted(() => vi.fn())
const useDeleteProductMock = vi.hoisted(() => vi.fn())
const useSuspendProductMock = vi.hoisted(() => vi.fn())
const useResumeProductMock = vi.hoisted(() => vi.fn())

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

const createNavItems = (onSelect: (id: string) => void) => [
  { id: 'products', label: 'Products', onClick: () => onSelect('products') },
  { id: 'licenses', label: 'Licenses', onClick: () => onSelect('licenses') },
]

const ScreenHost = ({
  role,
  vendorId,
}: {
  role: 'SUPERUSER' | 'ADMIN' | 'VENDOR_MANAGER' | 'VIEWER'
  vendorId: string
}) => {
  const product = buildProduct({ vendorId, status: 'ACTIVE' })
  const license = buildLicense({ vendorId, status: 'ACTIVE' })
  const onRefresh = vi.fn()
  const [active, setActive] = useState<'products' | 'licenses'>('products')
  const items = createNavItems(setActive)

  return (
    <AppShell sidebar={<SidebarNav items={items} />} topBar={null} currentUser={{ role, vendorId }}>
      {active === 'products' ? (
        <ProductManagementExample
          client={{} as never}
          products={[product]}
          currentUser={{ role, vendorId }}
          onRefresh={onRefresh}
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
          currentUser={{ role, vendorId }}
          onRefresh={onRefresh}
        />
      ) : null}
    </AppShell>
  )
}

describe('Screen-level navigation and flows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCreateProductMock.mockReturnValue(mockMutation())
    useUpdateProductMock.mockReturnValue(mockMutation())
    useDeleteProductMock.mockReturnValue(mockMutation())
    useSuspendProductMock.mockReturnValue(mockMutation())
    useResumeProductMock.mockReturnValue(mockMutation())

    useCreateLicenseMock.mockReturnValue(mockMutation())
    useUpdateLicenseMock.mockReturnValue(mockMutation())
    useRevokeLicenseMock.mockReturnValue(mockMutation())
    useSuspendLicenseMock.mockReturnValue(mockMutation())
    useResumeLicenseMock.mockReturnValue(mockMutation())
  })

  test('SUPERUSER navigates between products and licenses and sees edit actions', async () => {
    const vendorId = faker.string.uuid()
    renderWithProviders(<ScreenHost role="SUPERUSER" vendorId={vendorId} />)

    expect(screen.getByText(UI_PRODUCT_BUTTON_EDIT)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Licenses'))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_EDIT)).toBeInTheDocument()
    })
  })

  test('VIEWER sees read-only views with no create/delete actions', () => {
    const vendorId = faker.string.uuid()
    renderWithProviders(<ScreenHost role="VIEWER" vendorId={vendorId} />)

    expect(screen.queryByText(UI_PRODUCT_BUTTON_CREATE)).toBeNull()
    expect(screen.queryByText(UI_PRODUCT_BUTTON_EDIT)).toBeNull()

    fireEvent.click(screen.getByText('Licenses'))
    expect(screen.queryByText(UI_LICENSE_BUTTON_EDIT)).toBeNull()
    expect(screen.queryByText(UI_LICENSE_ACTION_DELETE)).toBeNull()
  })
})

