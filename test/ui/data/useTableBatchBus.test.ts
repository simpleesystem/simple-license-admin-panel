import { act, render, renderHook } from '@testing-library/react'
import { createElement, Fragment } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { AgentServiceCredential, Client } from '@/simpleLicense'
import { UI_TABLE_BATCH_HINT } from '../../../src/ui/constants'
import { TABLE_BATCH_TABLE_AGENT_CREDENTIALS, useTableBatchBus } from '../../../src/ui/data/tableBatchBus'

vi.mock('../../../src/ui/data/tableBatchBus/buildTableBatchActions', () => ({
  useBuildTableBatchActions: vi.fn(() => [
    {
      id: 'test-batch-action',
      label: 'Test action',
      onExecute: vi.fn(),
    },
  ]),
  resolveTableBatchRowSelectable: vi.fn(() => () => true),
}))

const mockClient = {} as Client

const activeCredential = {
  id: 'credential-1',
  serviceAccountId: 'account-1',
  credentialName: 'CI token',
  clientId: 'slsa_test',
  scopes: [],
  createdAt: '2026-01-01T00:00:00.000Z',
} satisfies AgentServiceCredential

describe('useTableBatchBus', () => {
  it('exposes selection and batchBar when batch actions are enabled', () => {
    const { result } = renderHook(() =>
      useTableBatchBus<AgentServiceCredential, typeof TABLE_BATCH_TABLE_AGENT_CREDENTIALS>({
        tableId: TABLE_BATCH_TABLE_AGENT_CREDENTIALS,
        enabled: true,
        visibleRows: [activeCredential],
        rowKey: (row) => row.id,
        context: { client: mockClient },
      })
    )

    expect(result.current.batchBar).not.toBeNull()
    expect(result.current.selection).toBeDefined()
    const { getByText } = render(createElement(Fragment, null, result.current.batchBar))
    expect(getByText(UI_TABLE_BATCH_HINT)).toBeInTheDocument()

    act(() => {
      result.current.selection?.onToggleRow(activeCredential)
    })
    expect(result.current.selectedIds).toEqual(['credential-1'])
  })

  it('hides batch UI when disabled', () => {
    const { result } = renderHook(() =>
      useTableBatchBus<AgentServiceCredential, typeof TABLE_BATCH_TABLE_AGENT_CREDENTIALS>({
        tableId: TABLE_BATCH_TABLE_AGENT_CREDENTIALS,
        enabled: false,
        visibleRows: [activeCredential],
        rowKey: (row) => row.id,
        context: { client: mockClient },
      })
    )

    expect(result.current.batchBar).toBeNull()
    expect(result.current.selection).toBeUndefined()
  })
})
