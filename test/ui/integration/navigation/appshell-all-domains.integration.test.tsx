import { faker } from '@faker-js/faker'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'

import {
  UI_LICENSE_BUTTON_EDIT,
  UI_PRODUCT_BUTTON_EDIT,
  UI_TENANT_ACTION_EDIT,
  UI_USER_ACTION_EDIT,
} from '../../../../src/ui/constants'
import { AppShell } from '../../../../src/ui/layout/AppShell'
import { SidebarNav } from '../../../../src/ui/navigation/SidebarNav'
import { LicenseManagementExample } from '../../../../src/ui/workflows/LicenseManagementExample'
import { ProductManagementExample } from '../../../../src/ui/workflows/ProductManagementExample'
import { TenantManagementExample } from '../../../../src/ui/workflows/TenantManagementExample'
import { UserManagementExample } from '../../../../src/ui/workflows/UserManagementExample'
import { buildLicense } from '../../factories/licenseFactory'
import { buildProduct } from '../../factories/productFactory'
import { buildTenant } from '../../factories/tenantFactory'
import { buildUser } from '../../factories/userFactory'
import { renderWithProviders } from '../../utils'

const useCreateUserMock = vi.hoisted(() => vi.fn())
const useUpdateUserMock = vi.hoisted(() => vi.fn())
const useDeleteUserMock = vi.hoisted(() => vi.fn())
const useListUsersMock = vi.hoisted(() => vi.fn())

const useCreateTenantMock = vi.hoisted(() => vi.fn())
const useUpdateTenantMock = vi.hoisted(() => vi.fn())
const useDeleteTenantMock = vi.hoisted(() => vi.fn())
const useSuspendTenantMock = vi.hoisted(() => vi.fn())
const useResumeTenantMock = vi.hoisted(() => vi.fn())

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
    useCreateUser: useCreateUserMock,
    useUpdateUser: useUpdateUserMock,
    useDeleteUser: useDeleteUserMock,
    useListUsers: useListUsersMock,
    useCreateTenant: useCreateTenantMock,
    useUpdateTenant: useUpdateTenantMock,
    useDeleteTenant: useDeleteTenantMock,
    useSuspendTenant: useSuspendTenantMock,
    useResumeTenant: useResumeTenantMock,
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
  { id: 'users', label: 'Users', onClick: () => onSelect('users') },
  { id: 'tenants', label: 'Tenants', onClick: () => onSelect('tenants') },
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
  const onRefresh = vi.fn()
  const [active, setActive] = useState<'users' | 'tenants' | 'products' | 'licenses'>('users')
  const items = createNavItems(setActive)

  const user = buildUser({ vendorId })
  const tenant = buildTenant({ vendorId })
  const product = buildProduct({ vendorId, status: 'ACTIVE' })
  const license = buildLicense({ vendorId, status: 'ACTIVE' })

  return (
    <AppShell sidebar={<SidebarNav items={items} />} topBar={null} currentUser={{ role, vendorId }}>
      {active === 'users' ? (
        <UserManagementExample client={{} as never} users={[user]} currentUser={{ role, vendorId }} onRefresh={onRefresh} />
      ) : null}
      {active === 'tenants' ? (
        <TenantManagementExample
          client={{} as never}
          tenants={[tenant]}
          currentUser={{ role, vendorId }}
          onRefresh={onRefresh}
        />
      ) : null}
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

describe('AppShell navigation across all domains', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCreateUserMock.mockReturnValue(mockMutation())
    useUpdateUserMock.mockReturnValue(mockMutation())
    useDeleteUserMock.mockReturnValue(mockMutation())
    useListUsersMock.mockReturnValue({ data: { users: [] }, isLoading: false, isError: false })

    useCreateTenantMock.mockReturnValue(mockMutation())
    useUpdateTenantMock.mockReturnValue(mockMutation())
    useDeleteTenantMock.mockReturnValue(mockMutation())
    useSuspendTenantMock.mockReturnValue(mockMutation())
    useResumeTenantMock.mockReturnValue(mockMutation())

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

  test('SUPERUSER can see edit actions across domains when navigating', async () => {
    const vendorId = faker.string.uuid()
    renderWithProviders(<ScreenHost role="SUPERUSER" vendorId={vendorId} />)

    // Users
    await waitFor(() => {
      expect(screen.getByText(UI_USER_ACTION_EDIT)).toBeInTheDocument()
    })

    // Tenants
    fireEvent.click(screen.getByText('Tenants'))
    await waitFor(() => {
      expect(screen.getByText(UI_TENANT_ACTION_EDIT)).toBeInTheDocument()
    })

    // Products
    fireEvent.click(screen.getByText('Products'))
    await waitFor(() => {
      expect(screen.getByText(UI_PRODUCT_BUTTON_EDIT)).toBeInTheDocument()
    })

    // Licenses
    fireEvent.click(screen.getByText('Licenses'))
    await waitFor(() => {
      expect(screen.getByText(UI_LICENSE_BUTTON_EDIT)).toBeInTheDocument()
    })
  })

  test('VIEWER sees read-only across navigation', async () => {
    const vendorId = faker.string.uuid()
    renderWithProviders(<ScreenHost role="VIEWER" vendorId={vendorId} />)

    expect(screen.queryByText(UI_USER_ACTION_EDIT)).toBeNull()
    fireEvent.click(screen.getByText('Tenants'))
    expect(screen.queryByText(UI_TENANT_ACTION_EDIT)).toBeNull()
    fireEvent.click(screen.getByText('Products'))
    expect(screen.queryByText(UI_PRODUCT_BUTTON_EDIT)).toBeNull()
    fireEvent.click(screen.getByText('Licenses'))
    expect(screen.queryByText(UI_LICENSE_BUTTON_EDIT)).toBeNull()
  })
})

