import { describe, expect, it } from 'vitest'

import type { AgentServiceCredential, ProtectionBuildTokenMetadata } from '@/simpleLicense'
import { resolveTableBatchRowSelectable } from '../../../src/ui/data/tableBatchBus/buildTableBatchActions'
import {
  TABLE_BATCH_TABLE_AGENT_CREDENTIALS,
  TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS,
  TABLE_BATCH_TABLE_RELEASES,
} from '../../../src/ui/data/tableBatchBus/types'

describe('resolveTableBatchRowSelectable', () => {
  it('blocks promoted releases from batch delete selection', () => {
    const selectable = resolveTableBatchRowSelectable(TABLE_BATCH_TABLE_RELEASES, {
      client: {} as never,
      productId: 'product-1',
    })
    expect(selectable?.({ isPromoted: true } as never)).toBe(false)
    expect(selectable?.({ isPromoted: false } as never)).toBe(true)
  })

  it('allows only active agent credentials for batch revoke', () => {
    const selectable = resolveTableBatchRowSelectable(TABLE_BATCH_TABLE_AGENT_CREDENTIALS, {
      client: {} as never,
    })
    const active = {
      id: 'cred-1',
      revokedAt: null,
    } as AgentServiceCredential
    const revoked = {
      id: 'cred-2',
      revokedAt: '2026-01-02T00:00:00.000Z',
    } as AgentServiceCredential

    expect(selectable?.(active)).toBe(true)
    expect(selectable?.(revoked)).toBe(false)
  })

  it('allows only active protection build tokens for batch revoke', () => {
    const selectable = resolveTableBatchRowSelectable(TABLE_BATCH_TABLE_PROTECTION_BUILD_TOKENS, {
      client: {} as never,
      productId: 'product-1',
    })
    const active = {
      id: 'token-1',
      revoked_at: null,
      expires_at: null,
    } as ProtectionBuildTokenMetadata
    const revoked = {
      id: 'token-2',
      revoked_at: '2026-01-02T00:00:00.000Z',
      expires_at: null,
    } as ProtectionBuildTokenMetadata
    const expired = {
      id: 'token-3',
      revoked_at: null,
      expires_at: '2000-01-01T00:00:00.000Z',
    } as ProtectionBuildTokenMetadata

    expect(selectable?.(active)).toBe(true)
    expect(selectable?.(revoked)).toBe(false)
    expect(selectable?.(expired)).toBe(false)
  })
})
