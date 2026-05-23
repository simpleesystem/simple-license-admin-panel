import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Client } from '@/simpleLicense'
import {
  useBatchDeleteEntitlements,
  useBatchDeleteProducts,
  useBatchDeleteProductTiers,
  useBatchDeleteReleases,
  useBatchDeleteUsers,
  useBatchResumeProducts,
  useBatchResumeTenants,
  useBatchRevokeAgentServiceCredentials,
  useBatchRevokeProtectionBuildTokens,
  useBatchSoftDeleteLicenses,
  useBatchSuspendProducts,
  useBatchSuspendTenants,
} from '@/simpleLicense/hooks/useAdminBatch'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const createClient = () =>
  ({
    batchSoftDeleteLicenses: vi.fn().mockResolvedValue({ success: true }),
    batchDeleteReleases: vi.fn().mockResolvedValue({ success: true }),
    batchDeleteProducts: vi.fn().mockResolvedValue({ success: true }),
    batchSuspendProducts: vi.fn().mockResolvedValue({ success: true }),
    batchResumeProducts: vi.fn().mockResolvedValue({ success: true }),
    batchDeleteUsers: vi.fn().mockResolvedValue({ success: true }),
    batchSuspendTenants: vi.fn().mockResolvedValue({ success: true }),
    batchResumeTenants: vi.fn().mockResolvedValue({ success: true }),
    batchDeleteProductTiers: vi.fn().mockResolvedValue({ success: true }),
    batchDeleteEntitlements: vi.fn().mockResolvedValue({ success: true }),
    batchRevokeAgentServiceCredentials: vi.fn().mockResolvedValue({ success: true }),
    batchRevokeProtectionBuildTokens: vi.fn().mockResolvedValue({ success: true }),
  }) as unknown as Client

describe('useAdminBatch', () => {
  it('calls batchSoftDeleteLicenses', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchSoftDeleteLicenses(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ licenseKeys: ['lic-1'] })
    })
    expect(client.batchSoftDeleteLicenses).toHaveBeenCalledWith({ licenseKeys: ['lic-1'] })
  })

  it('calls batchDeleteReleases', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchDeleteReleases(client, 'prod-1'), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ releaseIds: ['rel-1'] })
    })
    expect(client.batchDeleteReleases).toHaveBeenCalledWith('prod-1', { releaseIds: ['rel-1'] })
  })

  it('calls batchDeleteProducts', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchDeleteProducts(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ productIds: ['prod-1'] })
    })
    expect(client.batchDeleteProducts).toHaveBeenCalledWith({ productIds: ['prod-1'] })
  })

  it('calls batchSuspendProducts', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchSuspendProducts(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ productIds: ['prod-1'] })
    })
    expect(client.batchSuspendProducts).toHaveBeenCalledWith({ productIds: ['prod-1'] })
  })

  it('calls batchResumeProducts', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchResumeProducts(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ productIds: ['prod-1'] })
    })
    expect(client.batchResumeProducts).toHaveBeenCalledWith({ productIds: ['prod-1'] })
  })

  it('calls batchDeleteUsers', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchDeleteUsers(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ userIds: ['user-1'] })
    })
    expect(client.batchDeleteUsers).toHaveBeenCalledWith({ userIds: ['user-1'] })
  })

  it('calls batchSuspendTenants', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchSuspendTenants(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ tenantIds: ['tenant-1'] })
    })
    expect(client.batchSuspendTenants).toHaveBeenCalledWith({ tenantIds: ['tenant-1'] })
  })

  it('calls batchResumeTenants', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchResumeTenants(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ tenantIds: ['tenant-1'] })
    })
    expect(client.batchResumeTenants).toHaveBeenCalledWith({ tenantIds: ['tenant-1'] })
  })

  it('calls batchDeleteProductTiers', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchDeleteProductTiers(client, 'prod-1'), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ tierIds: ['tier-1'] })
    })
    expect(client.batchDeleteProductTiers).toHaveBeenCalledWith('prod-1', { tierIds: ['tier-1'] })
  })

  it('calls batchDeleteEntitlements', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchDeleteEntitlements(client, 'prod-1'), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ entitlementIds: ['ent-1'] })
    })
    expect(client.batchDeleteEntitlements).toHaveBeenCalledWith('prod-1', { entitlementIds: ['ent-1'] })
  })

  it('calls batchRevokeAgentServiceCredentials', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchRevokeAgentServiceCredentials(client), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ credentialIds: ['cred-1'] })
    })
    expect(client.batchRevokeAgentServiceCredentials).toHaveBeenCalledWith({ credentialIds: ['cred-1'] })
  })

  it('calls batchRevokeProtectionBuildTokens', async () => {
    const client = createClient()
    const wrapper = createWrapper()
    const { result } = renderHook(() => useBatchRevokeProtectionBuildTokens(client, 'prod-1'), { wrapper })
    await act(async () => {
      await result.current.mutateAsync({ tokenIds: ['token-1'] })
    })
    expect(client.batchRevokeProtectionBuildTokens).toHaveBeenCalledWith('prod-1', { tokenIds: ['token-1'] })
  })
})
