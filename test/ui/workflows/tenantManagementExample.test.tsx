import { fireEvent, render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { type TenantListItem, TenantManagementExample } from '../../../src/ui/workflows/TenantManagementExample'

const useCreateTenantMock = vi.hoisted(() => vi.fn())
const useUpdateTenantMock = vi.hoisted(() => vi.fn())

vi.mock('@simple-license/react-sdk', async () => {
  const actual = await vi.importActual<typeof import('@simple-license/react-sdk')>('@simple-license/react-sdk')
  return {
    ...actual,
    useCreateTenant: useCreateTenantMock,
    useUpdateTenant: useUpdateTenantMock,
  }
})

vi.mock('../../../src/ui/workflows/TenantRowActions', () => ({
  TenantRowActions: ({ tenant }: { tenant: { id: string } }) => <div data-testid={`tenant-actions-${tenant.id}`} />,
}))

const mockMutation = () => ({
  mutateAsync: vi.fn(async () => ({})),
  isPending: false,
})

const sampleTenants: readonly TenantListItem[] = [
  {
    id: 'tenant-1',
    name: 'Tenant One',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
]

describe('TenantManagementExample', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('submits create tenant via modal', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(<TenantManagementExample client={{} as never} tenants={sampleTenants} />)

    fireEvent.click(getByText('Create Tenant'))
    fireEvent.click(getByRole('button', { name: 'Create tenant' }))

    await waitFor(() => expect(createMutation.mutateAsync).toHaveBeenCalled())
  })

  test('edits selected tenant', async () => {
    const createMutation = mockMutation()
    const updateMutation = mockMutation()
    useCreateTenantMock.mockReturnValue(createMutation)
    useUpdateTenantMock.mockReturnValue(updateMutation)

    const { getByText, getByRole } = render(<TenantManagementExample client={{} as never} tenants={sampleTenants} />)

    fireEvent.click(getByText('Edit'))
    fireEvent.click(getByRole('button', { name: 'Save tenant' }))

    await waitFor(() =>
      expect(updateMutation.mutateAsync).toHaveBeenCalledWith({
        id: 'tenant-1',
        data: expect.any(Object),
      })
    )
  })
})
