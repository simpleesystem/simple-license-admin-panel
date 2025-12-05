/**
 * Tests for useAdminAudit hooks
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuditLogs, useAuditVerification } from '@/hooks/useAdminAudit'
import type { AuditLogEntry, AuditLogFilters, AuditVerificationParams } from '@/types/api'
import { createQueryClientWrapper } from '../../utils/reactQueryWrapper'
import { createTestClient } from '../../utils/testClient'

describe('useAdminAudit', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches audit logs with filters', async () => {
    const client = createTestClient()
    const filters: AuditLogFilters = {
      adminId: 'admin-1',
      action: 'UPDATE',
      resourceType: 'LICENSE',
      limit: 10,
      offset: 0,
    }
    const logs: AuditLogEntry[] = [
      {
        id: '1',
        adminId: 'admin-1',
        adminUsername: 'admin@example.com',
        vendorId: 'vendor-1',
        action: 'UPDATE',
        resourceType: 'LICENSE',
        resourceId: 'license-123',
        details: { field: 'status' },
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        accessMethod: 'UI_API',
        unixUser: null,
        createdAt: new Date().toISOString(),
      },
    ]
    const getAuditLogsSpy = vi.spyOn(client, 'getAuditLogs').mockResolvedValue({
      logs,
      total: logs.length,
    })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAuditLogs(client, filters), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getAuditLogsSpy).toHaveBeenCalledWith(filters)
    expect(result.current.data?.logs).toEqual(logs)
  })

  it('fetches audit logs without filters', async () => {
    const client = createTestClient()
    const logs: AuditLogEntry[] = []
    const getAuditLogsSpy = vi.spyOn(client, 'getAuditLogs').mockResolvedValue({
      logs,
      total: logs.length,
    })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAuditLogs(client), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(getAuditLogsSpy).toHaveBeenCalledWith(undefined)
    expect(result.current.data?.total).toBe(logs.length)
  })

  it('verifies audit chain with optional range', async () => {
    const client = createTestClient()
    const params: AuditVerificationParams = { fromId: '10', toId: '20' }
    const verifySpy = vi.spyOn(client, 'verifyAuditChain').mockResolvedValue({
      valid: true,
      totalEntries: 10,
      verifiedEntries: 10,
      brokenLinks: [],
    })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAuditVerification(client, params), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(verifySpy).toHaveBeenCalledWith(params)
    expect(result.current.data?.valid).toBe(true)
  })

  it('verifies audit chain without params', async () => {
    const client = createTestClient()
    const verifySpy = vi.spyOn(client, 'verifyAuditChain').mockResolvedValue({
      valid: true,
      totalEntries: 0,
      verifiedEntries: 0,
      brokenLinks: [],
    })

    const wrapper = createQueryClientWrapper()
    const { result } = renderHook(() => useAuditVerification(client), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(verifySpy).toHaveBeenCalledWith(undefined)
    expect(result.current.data?.verifiedEntries).toBe(0)
  })
})
