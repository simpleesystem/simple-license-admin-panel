import { faker } from '@faker-js/faker'
import { buildRelease } from '@test/factories/releaseFactory'
import { renderHookWithQueryClient } from '@test/utils/renderHookWithQueryClient'
import { waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Client } from '@/simpleLicense'
import { useAdminReleases, useCreateRelease, usePromoteRelease } from '@/simpleLicense/hooks/useAdminReleases'

describe('useAdminReleases hooks', () => {
  let mockClient: Client
  const mockProductId = faker.string.uuid()

  beforeEach(() => {
    mockClient = {
      listReleases: vi.fn(),
      createRelease: vi.fn(),
      promoteRelease: vi.fn(),
    } as unknown as Client
  })

  describe('useAdminReleases', () => {
    it('fetches releases successfully when productId is set', async () => {
      const releases = [buildRelease(), buildRelease()]
      ;(mockClient.listReleases as ReturnType<typeof vi.fn>).mockResolvedValue(releases)

      const { result } = renderHookWithQueryClient(() => useAdminReleases(mockClient, mockProductId))

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(releases)
      expect(mockClient.listReleases).toHaveBeenCalledWith(mockProductId, undefined)
    })

    it('does not fetch when productId is empty', () => {
      const { result } = renderHookWithQueryClient(() => useAdminReleases(mockClient, ''))

      expect(result.current.isFetching).toBe(false)
      expect(mockClient.listReleases).not.toHaveBeenCalled()
    })

    it('handles fetch error', async () => {
      const mockError = new Error('Failed to fetch releases')
      ;(mockClient.listReleases as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useAdminReleases(mockClient, mockProductId))

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useCreateRelease', () => {
    it('creates release successfully and invalidates queries', async () => {
      const release = buildRelease()
      const formData = new FormData()
      ;(mockClient.createRelease as ReturnType<typeof vi.fn>).mockResolvedValue(release)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => useCreateRelease(mockClient, mockProductId), { queryClient })

      result.current.mutate(formData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(release)
      expect(mockClient.createRelease).toHaveBeenCalledWith(mockProductId, formData)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })

    it('handles create error', async () => {
      const formData = new FormData()
      const mockError = new Error('Failed to create release')
      ;(mockClient.createRelease as ReturnType<typeof vi.fn>).mockRejectedValue(mockError)

      const { result } = renderHookWithQueryClient(() => useCreateRelease(mockClient, mockProductId))

      result.current.mutate(formData)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('usePromoteRelease', () => {
    it('promotes release successfully and invalidates queries', async () => {
      const release = buildRelease({ isPromoted: true })
      ;(mockClient.promoteRelease as ReturnType<typeof vi.fn>).mockResolvedValue(release)

      const queryClient = new (await import('@tanstack/react-query')).QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      })
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHookWithQueryClient(() => usePromoteRelease(mockClient, mockProductId), { queryClient })

      const releaseId = faker.string.uuid()
      result.current.mutate(releaseId)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(release)
      expect(mockClient.promoteRelease).toHaveBeenCalledWith(mockProductId, releaseId)
      expect(invalidateQueriesSpy).toHaveBeenCalled()
    })
  })
})
