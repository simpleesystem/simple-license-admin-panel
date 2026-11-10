import { useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import type { Client } from '@/simpleLicense'
import type { ReleaseOperationRecord } from '../../simpleLicense/utils/releasePublicationOperation'

export function ReleaseOperationRecovery({ client, productId }: { client: Client; productId: string }) {
  const [rows, setRows] = useState<ReleaseOperationRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [files, setFiles] = useState<Record<string, File | undefined>>({})
  const context = useRef({ client, productId })
  useEffect(() => {
    context.current = { client, productId }
    setRows([])
    setError(null)
    setFiles({})
    setPending(false)
  }, [productId, client])
  const load = async () => {
    const requestContext = context.current
    setPending(true)
    setError(null)
    try {
      const records = await client.retainedReleaseOperations(productId)
      if (context.current === requestContext) {
        setRows(records)
      }
    } catch {
      if (context.current === requestContext) {
        setError('Retained operations could not be read. Their outcomes remain unresolved.')
      }
    } finally {
      if (context.current === requestContext) {
        setPending(false)
      }
    }
  }
  const inspect = async (row: ReleaseOperationRecord, reconcile: boolean) => {
    const requestContext = context.current
    setPending(true)
    setError(null)
    try {
      const receipt = reconcile
        ? await client.reconcileReleaseOperation(productId, row.id)
        : await client.getReleaseOperationStatus(productId, row.id)
      if (context.current === requestContext) {
        setRows((current) => current.map((item) => (item.id === row.id ? { ...item, receipt } : item)))
      }
    } catch {
      if (context.current === requestContext) {
        setError('The original operation could not be verified. Keep its ID and check again when access is available.')
      }
    } finally {
      if (context.current === requestContext) {
        setPending(false)
      }
    }
  }
  const resume = async (row: ReleaseOperationRecord) => {
    const file = files[row.id]
    if (!file || row.dispatchStarted) {
      return
    }
    const requestContext = context.current
    setPending(true)
    try {
      const result = await client.resumePreparedReleaseOperation(productId, row.id, file)
      if (context.current === requestContext) {
        setRows((current) =>
          current.map((item) =>
            item.id === row.id
              ? { ...item, dispatchStarted: true, ...(result.publication ? { receipt: result.publication } : {}) }
              : item
          )
        )
      }
    } catch {
      if (context.current === requestContext) {
        setError(
          'The original prepared operation could not be completed. Keep its ID and check status; no replacement operation was created.'
        )
      }
    } finally {
      if (context.current === requestContext) {
        setPending(false)
      }
    }
  }
  const resumeMaintenance = async (row: ReleaseOperationRecord) => {
    if (row.dispatchStarted) {
      return
    }
    const requestContext = context.current
    setPending(true)
    setError(null)
    try {
      const receipt = await client.resumePreparedReleaseMaintenance(productId, row.id)
      if (context.current === requestContext) {
        setRows((current) =>
          current.map((item) => (item.id === row.id ? { ...item, dispatchStarted: true, receipt } : item))
        )
      }
    } catch {
      if (context.current === requestContext) {
        setError(
          'The retained maintenance operation remains unresolved. Keep its ID; a dispatched action is checked by status, never repeated.'
        )
      }
    } finally {
      if (context.current === requestContext) {
        setPending(false)
      }
    }
  }
  if (!productId) {
    return null
  }
  return (
    <section aria-label="Retained release operations">
      <Button
        variant="outline-secondary"
        size="sm"
        disabled={pending}
        onClick={() => {
          void load()
        }}
      >
        Load retained operations
      </Button>
      {error ? <p role="alert">{error}</p> : null}
      {rows.map((row) => (
        <div key={row.id} className="my-2">
          <code>{row.id}</code>{' '}
          <span>
            {row.action} {row.version}
          </span>
          <p>
            {row.receipt
              ? `${row.receipt.state} · ${row.receipt.effect}`
              : 'Outcome unknown; check the original operation.'}
          </p>
          {row.receipt?.effect === 'OBJECT_RETAINED' ? (
            <p>Catalog entry tombstoned. Artifact bytes remain retained.</p>
          ) : null}
          {row.receipt?.state === 'READY' && !row.receipt.eligible ? (
            <p>Recorded, currently unavailable for downloads.</p>
          ) : null}
          {!row.dispatchStarted && row.metadata && (row.action === 'create' || row.action === 'repair-missing') ? (
            <div>
              <label>
                Reselect original ZIP{' '}
                <input
                  type="file"
                  accept=".zip"
                  disabled={pending}
                  aria-label={`Original ZIP ${row.id}`}
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    setFiles((current) => ({ ...current, [row.id]: file }))
                  }}
                />
              </label>
              <Button
                size="sm"
                disabled={pending || !files[row.id]}
                onClick={() => {
                  void resume(row)
                }}
              >
                Resume original first attempt
              </Button>
            </div>
          ) : null}
          {!row.dispatchStarted && row.expected && (row.action === 'delete' || row.action === 'promote') ? (
            <Button
              size="sm"
              disabled={pending}
              aria-label={`Resume maintenance ${row.id}`}
              onClick={() => {
                void resumeMaintenance(row)
              }}
            >
              Resume original maintenance attempt
            </Button>
          ) : null}
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pending}
            aria-label={`Check ${row.id}`}
            onClick={() => {
              void inspect(row, false)
            }}
          >
            Check status
          </Button>{' '}
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pending || row.receipt?.state === 'READY' || row.receipt?.state === 'TOMBSTONED'}
            aria-label={`Reconcile ${row.id}`}
            onClick={() => {
              void inspect(row, true)
            }}
          >
            Reconcile original operation
          </Button>
        </div>
      ))}
    </section>
  )
}
