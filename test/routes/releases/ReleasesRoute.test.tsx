import { buildProduct } from '@test/factories/productFactory'
import { buildRelease } from '@test/factories/releaseFactory'
import { buildUser } from '@test/factories/userFactory'
import { renderWithProviders } from '@test/utils/renderWithProviders'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReleasesRouteComponent } from '@/routes/releases/ReleasesRoute'
import {
  UI_PAGE_TITLE_RELEASES,
  UI_RELEASE_EMPTY_MESSAGE,
  UI_RELEASE_SELECT_PRODUCT_BODY,
  UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER,
  UI_RELEASE_STATUS_ACTION_RETRY,
  UI_RELEASE_STATUS_ERROR_TITLE,
  UI_RELEASE_STATUS_LOADING_TITLE,
  UI_USER_ROLE_SUPERUSER,
} from '@/ui/constants'

const useAdminProductsMock = vi.hoisted(() => vi.fn())
const useAdminReleasesMock = vi.hoisted(() => vi.fn())
const useCreateReleaseMock = vi.hoisted(() => vi.fn())
const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock('@/simpleLicense/hooks', async () => {
  const actual = await vi.importActual<typeof import('@/simpleLicense/hooks')>('@/simpleLicense/hooks')
  return {
    ...actual,
    useAdminProducts: useAdminProductsMock,
    useAdminReleases: useAdminReleasesMock,
    useCreateRelease: useCreateReleaseMock,
  }
})

vi.mock('@/app/auth/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/app/auth/useAuth', () => ({
  useAuth: useAuthMock,
}))

describe('ReleasesRouteComponent', () => {
  beforeEach(() => {
    useAdminProductsMock.mockReturnValue({ data: [], isLoading: false, isError: false })
    useAdminReleasesMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useCreateReleaseMock.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
    })
    useAuthMock.mockReturnValue({ user: null, currentUser: null, isAuthenticated: false })
  })

  it('renders page title and empty state when no product is selected', () => {
    renderWithProviders(<ReleasesRouteComponent />)

    expect(screen.getByRole('heading', { name: UI_PAGE_TITLE_RELEASES })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER })).toBeInTheDocument()
    expect(screen.getByText(UI_RELEASE_SELECT_PRODUCT_BODY)).toBeInTheDocument()
  })

  it('shows loading state when product is selected and releases are loading', async () => {
    const product = buildProduct()
    useAdminProductsMock.mockReturnValue({
      data: [product],
      isLoading: false,
      isError: false,
    })
    useAdminReleasesMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })
    useAuthMock.mockReturnValue({
      user: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      currentUser: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      isAuthenticated: true,
    })

    renderWithProviders(<ReleasesRouteComponent />)

    const select = screen.getByRole('combobox', { name: UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER })
    fireEvent.change(select, { target: { value: product.id } })

    await waitFor(() => {
      expect(screen.getByText(UI_RELEASE_STATUS_LOADING_TITLE)).toBeInTheDocument()
    })
  })

  it('shows error state and retry when releases fetch fails', async () => {
    const product = buildProduct()
    const refetch = vi.fn()
    useAdminProductsMock.mockReturnValue({
      data: [product],
      isLoading: false,
      isError: false,
    })
    useAdminReleasesMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    })
    useAuthMock.mockReturnValue({
      user: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      currentUser: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      isAuthenticated: true,
    })

    renderWithProviders(<ReleasesRouteComponent />)

    const select = screen.getByRole('combobox', { name: UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER })
    fireEvent.change(select, { target: { value: product.id } })

    await waitFor(() => {
      expect(screen.getByText(UI_RELEASE_STATUS_ERROR_TITLE)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: UI_RELEASE_STATUS_ACTION_RETRY }))
    expect(refetch).toHaveBeenCalled()
  })

  it('shows empty releases message when product has no releases', async () => {
    const product = buildProduct()
    useAdminProductsMock.mockReturnValue({
      data: [product],
      isLoading: false,
      isError: false,
    })
    useAdminReleasesMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useAuthMock.mockReturnValue({
      user: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      currentUser: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      isAuthenticated: true,
    })

    renderWithProviders(<ReleasesRouteComponent />)

    const select = screen.getByRole('combobox', { name: UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER })
    fireEvent.change(select, { target: { value: product.id } })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: UI_RELEASE_EMPTY_MESSAGE })).toBeInTheDocument()
    })
  })

  it('shows releases table when product has releases', async () => {
    const product = buildProduct()
    const release = buildRelease({ version: '1.2.3', fileName: 'my-plugin.zip' })
    useAdminProductsMock.mockReturnValue({
      data: [product],
      isLoading: false,
      isError: false,
    })
    useAdminReleasesMock.mockReturnValue({
      data: [release],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })
    useAuthMock.mockReturnValue({
      user: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      currentUser: buildUser({ role: UI_USER_ROLE_SUPERUSER, vendorId: null }),
      isAuthenticated: true,
    })

    renderWithProviders(<ReleasesRouteComponent />)

    const select = screen.getByRole('combobox', { name: UI_RELEASE_SELECT_PRODUCT_PLACEHOLDER })
    fireEvent.change(select, { target: { value: product.id } })

    await waitFor(() => {
      expect(screen.getByText(release.version)).toBeInTheDocument()
      expect(screen.getByText(release.fileName)).toBeInTheDocument()
    })
  })
})
