/**
 * Tests for useAdminSystem hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useHealthMetrics, useServerStatus, useSystemMetrics } from '@/hooks/useAdminSystem'
import type { HealthMetricsResponse, MetricsResponse, ServerStatusResponse } from '@/types/api'
import {
  TEST_NUMBER_ONE,
  TEST_NUMBER_TEN,
  TEST_NUMBER_ZERO,
  TEST_STATUS_HEALTHY,
  TEST_STATUS_UNHEALTHY,
  TEST_STRING_VALUE,
} from '../../constants'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminSystem', () => {
  it('fetches server status', async () => {
    const client = createTestClient()
    const status: ServerStatusResponse = {
      status: TEST_STATUS_HEALTHY as 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: TEST_STATUS_HEALTHY,
      },
    }

    const getServerStatusSpy = vi.spyOn(client, 'getServerStatus').mockResolvedValue(status)
    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useServerStatus(client), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getServerStatusSpy).toHaveBeenCalledTimes(1)
    expect(result.current.data?.status).toBe(TEST_STATUS_HEALTHY)
  })

  it('fetches health metrics', async () => {
    const client = createTestClient()
    const metrics: HealthMetricsResponse = {
      metrics: {
        uptime: TEST_NUMBER_TEN,
        memory: {
          rss: TEST_NUMBER_TEN,
          heapTotal: TEST_NUMBER_TEN,
          heapUsed: TEST_NUMBER_ONE,
          external: TEST_NUMBER_ZERO,
        },
        cpu: {
          user: TEST_NUMBER_ONE,
          system: TEST_NUMBER_ONE,
        },
      },
    }

    const getHealthSpy = vi.spyOn(client, 'getHealthMetrics').mockResolvedValue(metrics)
    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useHealthMetrics(client), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getHealthSpy).toHaveBeenCalledTimes(1)
    expect(result.current.data?.metrics.uptime).toBe(TEST_NUMBER_TEN)
  })

  it('fetches system metrics', async () => {
    const client = createTestClient()
    const metrics: MetricsResponse = {
      timestamp: new Date().toISOString(),
      application: {
        version: TEST_STRING_VALUE,
        environment: TEST_STRING_VALUE,
      },
      system: {
        uptime: TEST_NUMBER_TEN,
        memory: {
          rss: TEST_NUMBER_TEN,
          heapTotal: TEST_NUMBER_TEN,
          heapUsed: TEST_NUMBER_ONE,
          external: TEST_NUMBER_ZERO,
        },
        cpu: {
          user: TEST_NUMBER_ONE,
          system: TEST_NUMBER_ONE,
        },
      },
      database: {
        status: TEST_STATUS_HEALTHY,
      },
      cache: {
        status: TEST_STATUS_UNHEALTHY,
      },
      security: {
        status: TEST_STATUS_HEALTHY,
      },
      tenants: {
        status: TEST_STATUS_HEALTHY,
      },
    }

    const getMetricsSpy = vi.spyOn(client, 'getSystemMetrics').mockResolvedValue(metrics)
    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useSystemMetrics(client), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getMetricsSpy).toHaveBeenCalledTimes(1)
    expect(result.current.data?.application.version).toBe(TEST_STRING_VALUE)
  })
})
