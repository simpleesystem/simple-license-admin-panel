/**
 * Tests for useAdminAnalytics hooks
 * @vitest-environment jsdom
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  useActivationDistribution,
  useAlertThresholds,
  useLicenseUsageDetails,
  useSystemStats,
  useTopLicenses,
  useUpdateAlertThresholds,
  useUsageSummaries,
  useUsageTrends,
} from '@/hooks/useAdminAnalytics'
import { TEST_NUMBER_ONE, TEST_NUMBER_TEN, TEST_NUMBER_ZERO } from '../../constants'
import { createHttpResponse, createSuccessResponse } from '../../factories/response'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminAnalytics', () => {
  describe('useSystemStats', () => {
    it('should fetch system stats successfully', async () => {
      const client = createTestClient()
      const stats = {
        stats: {
          active_licenses: TEST_NUMBER_TEN,
          expired_licenses: TEST_NUMBER_ZERO,
          total_customers: TEST_NUMBER_TEN,
          total_activations: TEST_NUMBER_TEN,
        },
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(stats)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useSystemStats(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.stats).toBeDefined()
    })
  })

  describe('useUsageSummaries', () => {
    it('should fetch usage summaries successfully', async () => {
      const client = createTestClient()
      const summaries = {
        summaries: [
          {
            id: TEST_NUMBER_ONE,
            tenantId: null,
            licenseId: TEST_NUMBER_ONE,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
            totalActivations: TEST_NUMBER_ONE,
            totalValidations: TEST_NUMBER_ONE,
            totalUsageReports: TEST_NUMBER_ONE,
            uniqueDomains: TEST_NUMBER_ONE,
            uniqueIPs: TEST_NUMBER_ONE,
            peakConcurrency: TEST_NUMBER_ONE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(summaries)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUsageSummaries(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.summaries).toBeDefined()
    })
  })

  describe('useUsageTrends', () => {
    it('should fetch usage trends successfully', async () => {
      const client = createTestClient()
      const trends = {
        periodStart: new Date().toISOString(),
        periodEnd: new Date().toISOString(),
        groupBy: 'day',
        trends: [
          {
            period: new Date().toISOString(),
            totalActivations: TEST_NUMBER_ONE,
            totalValidations: TEST_NUMBER_ONE,
            totalUsageReports: TEST_NUMBER_ONE,
            uniqueDomains: TEST_NUMBER_ONE,
            uniqueIPs: TEST_NUMBER_ONE,
            peakConcurrency: TEST_NUMBER_ONE,
          },
        ],
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(trends)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUsageTrends(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.trends).toBeDefined()
    })
  })

  describe('useLicenseUsageDetails', () => {
    it('should fetch license usage details successfully', async () => {
      const client = createTestClient()
      const details = {
        licenseKey: 'LIC-123',
        licenseId: TEST_NUMBER_ONE,
        summaries: [
          {
            id: TEST_NUMBER_ONE,
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
            totalActivations: TEST_NUMBER_ONE,
            totalValidations: TEST_NUMBER_ONE,
            totalUsageReports: TEST_NUMBER_ONE,
            uniqueDomains: TEST_NUMBER_ONE,
            uniqueIPs: TEST_NUMBER_ONE,
            peakConcurrency: TEST_NUMBER_ONE,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(details)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(
        () => useLicenseUsageDetails(client, 'LIC-123', { periodStart: '2023-01-01', periodEnd: '2023-01-31' }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.summaries).toHaveLength(TEST_NUMBER_ONE)
    })
  })

  describe('useTopLicenses', () => {
    it('should fetch top licenses successfully', async () => {
      const client = createTestClient()
      const topLicenses = {
        licenses: [
          {
            licenseKey: 'LIC-ABC',
            customerEmail: 'test@example.com',
            totalActivations: TEST_NUMBER_ONE,
            totalValidations: TEST_NUMBER_ONE,
            peakConcurrency: TEST_NUMBER_ONE,
            lastActivatedAt: new Date().toISOString(),
          },
        ],
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(topLicenses)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useTopLicenses(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.licenses).toHaveLength(TEST_NUMBER_ONE)
    })
  })

  describe('useActivationDistribution', () => {
    it('should fetch activation distribution successfully', async () => {
      const client = createTestClient()
      const distribution = {
        distribution: [
          {
            licenseKey: 'LIC-XYZ',
            activations: TEST_NUMBER_ONE,
            validations: TEST_NUMBER_ONE,
          },
        ],
      }
      const mockGet = vi.fn().mockResolvedValue(createHttpResponse(createSuccessResponse(distribution)))
      // @ts-expect-error - accessing private property for testing
      client.httpClient.get = mockGet

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useActivationDistribution(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.distribution).toHaveLength(TEST_NUMBER_ONE)
    })
  })

  describe('useAlertThresholds', () => {
    it('should fetch alert thresholds successfully', async () => {
      const client = createTestClient()
      const thresholds = {
        high: {
          activations: TEST_NUMBER_TEN,
          validations: TEST_NUMBER_TEN,
          concurrency: TEST_NUMBER_TEN,
        },
        medium: {
          activations: TEST_NUMBER_ONE,
          validations: TEST_NUMBER_ONE,
          concurrency: TEST_NUMBER_ONE,
        },
      }
      vi.spyOn(client, 'getAlertThresholds').mockResolvedValue(thresholds)

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useAlertThresholds(client), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data?.high.activations).toBe(TEST_NUMBER_TEN)
    })
  })

  describe('useUpdateAlertThresholds', () => {
    it('should update alert thresholds successfully', async () => {
      const client = createTestClient()
      const thresholds = {
        high: {
          activations: TEST_NUMBER_TEN,
          validations: TEST_NUMBER_TEN,
          concurrency: TEST_NUMBER_TEN,
        },
        medium: {
          activations: TEST_NUMBER_ONE,
          validations: TEST_NUMBER_ONE,
          concurrency: TEST_NUMBER_ONE,
        },
      }
      vi.spyOn(client, 'updateAlertThresholds').mockResolvedValue(thresholds)

      const wrapper = createQueryClientWrapper()
      const { result } = renderHook(() => useUpdateAlertThresholds(client), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          high_activations: TEST_NUMBER_TEN,
          high_validations: TEST_NUMBER_TEN,
          high_concurrency: TEST_NUMBER_TEN,
          medium_activations: TEST_NUMBER_ONE,
          medium_validations: TEST_NUMBER_ONE,
          medium_concurrency: TEST_NUMBER_ONE,
        })
      })

      expect(client.updateAlertThresholds).toHaveBeenCalledWith({
        high_activations: TEST_NUMBER_TEN,
        high_validations: TEST_NUMBER_TEN,
        high_concurrency: TEST_NUMBER_TEN,
        medium_activations: TEST_NUMBER_ONE,
        medium_validations: TEST_NUMBER_ONE,
        medium_concurrency: TEST_NUMBER_ONE,
      })
    })
  })
})
