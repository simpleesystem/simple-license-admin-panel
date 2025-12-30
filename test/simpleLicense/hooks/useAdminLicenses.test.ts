import { describe, expect, it, vi, beforeEach } from 'vitest'
import { waitFor } from '@testing-library/react'
import type { Client } from '@/simpleLicense'
import {
  useAdminLicenses,
  useAdminLicense,
  useCreateLicense,
  useUpdateLicense,
  useSuspendLicense,
  useResumeLicense,
  useFreezeLicense,
  useRevokeLicense,
  useLicenseActivations,
} from '@/simpleLicense/hooks/useAdminLicenses'
import { buildLicense } from '@test/factories/licenseFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { faker } from '@faker-js/faker'

describe('useAdminLicenses hooks', () => {
  let mockClient: Client
  const mockLicenseId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listLicenses: vi.fn(),
      getLicense: vi.fn(),
      createLicense: vi.fn(),
      updateLicense: vi.fn(),
      suspendLicense: vi.fn(),
      resumeLicense: vi.fn(),
      freezeLicense: vi.fn(),
      revokeLicense: vi.fn(),
      getLicenseActivations: vi.fn(),
    } as unknown as Client
  })

  describe('useAdminLicenses', () => {
    it('fetches licenses successfully', async () => {
      const licenses = [buildLicense(), buildLicense()]
      const mockResponse = { data: licenses, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } }
      ;(mockClient.listLicenses as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminLicenses(mockClient))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.listLicenses).toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch licenses')
      ;(mockClient.listLicenses as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useAdminLicenses(mockClient))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })

    it('passes filters to client', async () => {
      const filters = { status: 'ACTIVE' as const, page: 1 }
      const mockResponse = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
      ;(mockClient.listLicenses as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminLicenses(mockClient, filters))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockClient.listLicenses).toHaveBeenCalledWith(filters)
    })
  })

  describe('useAdminLicense', () => {
    it('fetches license successfully', async () => {
      const license = buildLicense()
      const mockResponse = { license }
      ;(mockClient.getLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() => useAdminLicense(mockClient, mockLicenseId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getLicense).toHaveBeenCalledWith(mockLicenseId)
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHookWithQueryClient(() => useAdminLicense(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.getLicense).not.toHaveBeenCalled()
    })
  })

  describe('useCreateLicense', () => {
    it('creates license successfully and invalidates queries', async () => {
      const license = buildLicense()
      const mockRequest = {
        customer_email: license.customerEmail,
        product_slug: license.productSlug,
        tier_code: license.tierCode,
        domain: license.domain,
      }
      const mockResponse = { license }
      ;(mockClient.createLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useCreateLicense(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.createLicense).toHaveBeenCalledWith(mockRequest)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const mockRequest = {
        customer_email: faker.internet.email(),
        product_slug: faker.lorem.slug(),
        tier_code: faker.helpers.arrayElement(['FREE', 'STARTER', 'PROFESSIONAL']),
      }
      const mockError = new Error('Failed to create license')
      ;(mockClient.createLicense as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCreateLicense(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useUpdateLicense', () => {
    it('updates license successfully and invalidates queries', async () => {
      const license = buildLicense()
      const mockRequest = {
        id: license.id,
        data: {
          customer_email: license.customerEmail,
          tier_code: license.tierCode,
        },
      }
      const mockResponse = { license }
      ;(mockClient.updateLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useUpdateLicense(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.updateLicense).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles update error', async () => {
      const mockRequest = {
        id: mockLicenseId,
        data: {
          customer_email: faker.internet.email(),
        },
      }
      const mockError = new Error('Failed to update license')
      ;(mockClient.updateLicense as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useUpdateLicense(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useSuspendLicense', () => {
    it('suspends license successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.suspendLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useSuspendLicense(mockClient), {
        queryClient,
      })

      result.current.mutate(mockLicenseId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.suspendLicense).toHaveBeenCalledWith(mockLicenseId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles suspend error', async () => {
      const mockError = new Error('Failed to suspend license')
      ;(mockClient.suspendLicense as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useSuspendLicense(mockClient))

      result.current.mutate(mockLicenseId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useResumeLicense', () => {
    it('resumes license successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.resumeLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useResumeLicense(mockClient), {
        queryClient,
      })

      result.current.mutate(mockLicenseId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.resumeLicense).toHaveBeenCalledWith(mockLicenseId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles resume error', async () => {
      const mockError = new Error('Failed to resume license')
      ;(mockClient.resumeLicense as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useResumeLicense(mockClient))

      result.current.mutate(mockLicenseId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useFreezeLicense', () => {
    it('freezes license successfully and invalidates queries', async () => {
      const mockRequest = {
        id: mockLicenseId,
        data: {
          freeze_entitlements: true,
          freeze_tier: false,
        },
      }
      const mockResponse = { success: true }
      ;(mockClient.freezeLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useFreezeLicense(mockClient), {
        queryClient,
      })

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.freezeLicense).toHaveBeenCalledWith(mockRequest.id, mockRequest.data)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles freeze error', async () => {
      const mockRequest = {
        id: mockLicenseId,
        data: {
          freeze_entitlements: true,
        },
      }
      const mockError = new Error('Failed to freeze license')
      ;(mockClient.freezeLicense as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useFreezeLicense(mockClient))

      result.current.mutate(mockRequest)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useRevokeLicense', () => {
    it('revokes license successfully and invalidates queries', async () => {
      const mockResponse = { success: true }
      ;(mockClient.revokeLicense as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useRevokeLicense(mockClient), {
        queryClient,
      })

      result.current.mutate(mockLicenseId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.revokeLicense).toHaveBeenCalledWith(mockLicenseId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles revoke error', async () => {
      const mockError = new Error('Failed to revoke license')
      ;(mockClient.revokeLicense as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useRevokeLicense(mockClient))

      result.current.mutate(mockLicenseId)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useLicenseActivations', () => {
    it('fetches license activations successfully', async () => {
      const mockResponse = {
        activations: [
          {
            id: faker.string.uuid(),
            domain: faker.internet.domainName(),
            activated_at: faker.date.past().toISOString(),
          },
        ],
      }
      ;(mockClient.getLicenseActivations as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const { result } = renderHookWithQueryClient(() =>
        useLicenseActivations(mockClient, mockLicenseId)
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(mockClient.getLicenseActivations).toHaveBeenCalledWith(mockLicenseId)
    })

    it('does not fetch when id is empty', () => {
      const { result } = renderHookWithQueryClient(() => useLicenseActivations(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.getLicenseActivations).not.toHaveBeenCalled()
    })
  })
})

