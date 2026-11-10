import { buildRelease } from '@test/factories/releaseFactory'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Client } from '@/simpleLicense'
import { UI_TABLE_BATCH_TOAST_PARTIAL } from '@/ui/constants'
import { useBuildTableBatchActions } from '@/ui/data/tableBatchBus/buildTableBatchActions'
import { TABLE_BATCH_TABLE_RELEASES } from '@/ui/data/tableBatchBus/types'
import type { ReleaseListItem } from '@/ui/workflows/ReleasesPanel'

const emit = vi.hoisted(() => vi.fn())
vi.mock('@/notifications/useNotificationBus', () => ({ useNotificationBus: () => ({ emit }) }))

describe('Admin release batch action handoff', () => {
  beforeEach(() => emit.mockClear())
  const fixture = () => {
    const row = buildRelease({
      publicationState: 'READY',
      publicationRevision: 7,
      objectBindingFingerprint: 'a'.repeat(64),
    })
    const original = {
      releaseIds: [row.id],
      operations: [
        {
          operationId: crypto.randomUUID(),
          expected: {
            rowId: row.id,
            revision: 7,
            state: 'READY',
            objectBindingFingerprint: 'a'.repeat(64),
            liveProtectionEpoch: null,
          },
          scopeFingerprint: 'b'.repeat(64),
        },
      ],
    }
    const prepare = vi.fn(async () => original)
    const dispatch = vi.fn(async () => ({
      success: false,
      data: {
        deleted: [],
        deletedCount: 0,
        skipped: [],
        failed: [{ id: row.id, reason: 'OUTCOME_UNKNOWN' }],
        maxBatchSize: 100,
      },
    }))
    const refresh = vi.fn()
    // Only these two client methods are invoked by this hook; actual client/HTTP behavior has separate transport tests.
    const client = { prepareReleaseBatchDelete: prepare, batchDeleteReleases: dispatch } as unknown as Client
    const { result } = renderHook(() =>
      useBuildTableBatchActions<ReleaseListItem, typeof TABLE_BATCH_TABLE_RELEASES>(TABLE_BATCH_TABLE_RELEASES, {
        client,
        productId: 'product',
        onRefresh: refresh,
      })
    )
    const action = result.current.find((item) => item.id === 'release-batch-delete')
    if (!action) {
      throw new Error('Missing release batch action')
    }
    return { row, original, prepare, dispatch, refresh, action }
  }
  it('passes the selected displayed rows to preparation and the retained per-row operation packet to dispatch', async () => {
    const value = fixture()
    await value.action.onExecute([value.row])
    expect(value.prepare).toHaveBeenCalledWith('product', [value.row])
    expect(value.dispatch).toHaveBeenCalledWith('product', value.original)
    expect(emit).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ titleKey: UI_TABLE_BATCH_TOAST_PARTIAL })
    )
    expect(value.refresh).toHaveBeenCalledTimes(1)
  })
  it('does not dispatch after preparation refusal or advertise success', async () => {
    const value = fixture()
    value.prepare.mockRejectedValueOnce(new Error('retained unresolved intent'))
    await expect(value.action.onExecute([value.row])).rejects.toThrow('retained unresolved intent')
    expect(value.dispatch).not.toHaveBeenCalled()
    expect(emit).not.toHaveBeenCalled()
    expect(value.refresh).not.toHaveBeenCalled()
  })
  it('propagates response loss without replaying the batch or clearing the original packet', async () => {
    const value = fixture()
    value.dispatch.mockRejectedValueOnce(new Error('acknowledgement lost'))
    await expect(value.action.onExecute([value.row])).rejects.toThrow('acknowledgement lost')
    expect(value.prepare).toHaveBeenCalledTimes(1)
    expect(value.dispatch).toHaveBeenCalledTimes(1)
    expect(value.original.operations[0]?.expected.revision).toBe(7)
    expect(emit).not.toHaveBeenCalled()
    expect(value.refresh).not.toHaveBeenCalled()
  })
})
