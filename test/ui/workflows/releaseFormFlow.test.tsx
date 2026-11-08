import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Client } from '../../../src/simpleLicense'
import {
  UI_RELEASE_FORM_FIELD_CHANGELOG,
  UI_RELEASE_FORM_FIELD_FILE,
  UI_RELEASE_FORM_FIELD_PRERELEASE,
  UI_RELEASE_FORM_FIELD_VERSION,
  UI_RELEASE_FORM_SUBMIT,
  UI_RELEASE_MODAL_CANCEL,
} from '../../../src/ui/constants'
import { ReleaseFormFlow } from '../../../src/ui/workflows/ReleaseFormFlow'
import { ReleaseOperationRecovery } from '../../../src/ui/workflows/ReleaseOperationRecovery'

const createHook = vi.hoisted(() => vi.fn())
vi.mock('../../../src/simpleLicense/hooks', () => ({ useCreateRelease: createHook }))

const PRODUCT = 'synthetic-product'
const OPERATION = '11111111-1111-4111-8111-111111111111'
const RECORD = { id: OPERATION, action: 'create', productId: PRODUCT, version: '1.0.0' }

describe('Release original-operation recovery after closing or reloading the form', () => {
  it('loads the retained identity and checks status without creating another upload', async () => {
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([RECORD]),
      getReleaseOperationStatus: vi
        .fn()
        .mockResolvedValue({ state: 'OUTCOME_UNKNOWN', effect: 'UNKNOWN', reason: 'NONE' }),
      createRelease: vi.fn(),
      reconcileReleaseOperation: vi.fn(),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    fireEvent.click(screen.getByRole('button', { name: `Check ${OPERATION}` }))
    await waitFor(() => expect(client.getReleaseOperationStatus).toHaveBeenCalledWith(PRODUCT, OPERATION))
    expect(client.createRelease).not.toHaveBeenCalled()
  })
  it('keeps an unknown outcome visible when the status read fails', async () => {
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([RECORD]),
      getReleaseOperationStatus: vi.fn().mockRejectedValue(new Error('Status unavailable')),
      createRelease: vi.fn(),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    fireEvent.click(screen.getByRole('button', { name: `Check ${OPERATION}` }))
    await screen.findByRole('alert')
    expect(screen.getByText(OPERATION)).toBeTruthy()
    expect(client.createRelease).not.toHaveBeenCalled()
  })
  it('resumes only the retained prepared maintenance ID without reselecting an artifact or preparing another action', async () => {
    const record = { ...RECORD, action: 'delete', expected: { rowId: 'row', revision: 7 } }
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([record]),
      resumePreparedReleaseMaintenance: vi.fn().mockResolvedValue({ state: 'TOMBSTONED', effect: 'OBJECT_RETAINED' }),
      prepareReleaseMaintenance: vi.fn(),
      createRelease: vi.fn(),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    fireEvent.click(screen.getByRole('button', { name: `Resume maintenance ${OPERATION}` }))
    await screen.findByText('Catalog entry tombstoned. Artifact bytes remain retained.')
    expect(client.resumePreparedReleaseMaintenance).toHaveBeenCalledWith(PRODUCT, OPERATION)
    expect(client.prepareReleaseMaintenance).not.toHaveBeenCalled()
    expect(client.createRelease).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: `Resume maintenance ${OPERATION}` })).toBeNull()
  })
  it('offers no first-attempt maintenance button for an already dispatched or unknown original action', async () => {
    const record = {
      ...RECORD,
      action: 'promote',
      dispatchStarted: true,
      expected: { rowId: 'row', revision: 7 },
      receipt: { state: 'OUTCOME_UNKNOWN', effect: 'UNKNOWN' },
    }
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([record]),
      resumePreparedReleaseMaintenance: vi.fn(),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    expect(screen.queryByRole('button', { name: `Resume maintenance ${OPERATION}` })).toBeNull()
    expect(client.resumePreparedReleaseMaintenance).not.toHaveBeenCalled()
  })
})

describe('Release form uses the returned publication eligibility and retained operation', () => {
  beforeEach(() => createHook.mockReset())
  const fill = () => {
    fireEvent.change(screen.getByLabelText(UI_RELEASE_FORM_FIELD_VERSION), { target: { value: ' 1.0.0 ' } })
    fireEvent.change(screen.getByLabelText(UI_RELEASE_FORM_FIELD_FILE), {
      target: { files: [new File(['original'], 'original.zip')] },
    })
    fireEvent.change(screen.getByLabelText(UI_RELEASE_FORM_FIELD_CHANGELOG), { target: { value: ' changelog ' } })
    fireEvent.click(screen.getByLabelText(UI_RELEASE_FORM_FIELD_PRERELEASE))
  }
  it.each([true, false])('closes only after a confirmed eligible response (eligible=%s)', (eligible) => {
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    const mutate = vi.fn(
      (form: FormData, callbacks: { onSuccess: (value: { publication: { eligible: boolean } }) => void }) => {
        expect(form.get('version')).toBe('1.0.0')
        expect(form.get('changelogMd')).toBe('changelog')
        expect(form.get('isPrerelease')).toBe('true')
        callbacks.onSuccess({ publication: { eligible } })
      }
    )
    createHook.mockReturnValue({ mutate, isPending: false })
    render(
      <ReleaseFormFlow client={{} as Client} productId={PRODUCT} show={true} onClose={onClose} onSuccess={onSuccess} />
    )
    fill()
    fireEvent.click(screen.getByRole('button', { name: UI_RELEASE_FORM_SUBMIT }))
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(eligible ? 1 : 0)
    expect(onSuccess).toHaveBeenCalledTimes(eligible ? 1 : 0)
    if (eligible) {
      expect((screen.getByLabelText(UI_RELEASE_FORM_FIELD_VERSION) as HTMLInputElement).value).toBe('')
    } else {
      expect(screen.getByRole('alert').textContent).toContain('currently unavailable')
    }
  })
  it('shows the retained original ID on response loss and resets on cancel', () => {
    const onClose = vi.fn()
    const onError = vi.fn()
    const mutate = vi.fn((form: FormData, callbacks: { onError: (error: Error) => void }) => {
      form.set('operationId', OPERATION)
      callbacks.onError(new Error('Response lost'))
    })
    createHook.mockReturnValue({ mutate, isPending: false })
    render(
      <ReleaseFormFlow client={{} as Client} productId={PRODUCT} show={true} onClose={onClose} onError={onError} />
    )
    fill()
    fireEvent.click(screen.getByRole('button', { name: UI_RELEASE_FORM_SUBMIT }))
    expect(screen.getByRole('alert').textContent).toContain(OPERATION)
    expect(onClose).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: UI_RELEASE_MODAL_CANCEL }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).toBeNull()
    expect((screen.getByLabelText(UI_RELEASE_FORM_FIELD_VERSION) as HTMLInputElement).value).toBe('')
  })
})

describe('Retained recovery never replaces a missing result or changed view context', () => {
  it('resumes only the selected original ZIP and retains an unresolved ID after failure', async () => {
    const record = { ...RECORD, metadata: { isPrerelease: false }, dispatchStarted: false }
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([record]),
      resumePreparedReleaseOperation: vi.fn().mockRejectedValue(new Error('reply lost')),
      createRelease: vi.fn(),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    const file = new File(['original'], 'original.zip')
    fireEvent.change(screen.getByLabelText(`Original ZIP ${OPERATION}`), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Resume original first attempt' }))
    await screen.findByRole('alert')
    expect(client.resumePreparedReleaseOperation).toHaveBeenCalledWith(PRODUCT, OPERATION, file)
    expect(screen.getByText(OPERATION)).toBeTruthy()
    expect(client.createRelease).not.toHaveBeenCalled()
  })
  it('records successful resume and then offers status rather than another first attempt', async () => {
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([{ ...RECORD, metadata: {} }]),
      resumePreparedReleaseOperation: vi
        .fn()
        .mockResolvedValue({ publication: { state: 'READY', effect: 'CONFIRMED', eligible: false } }),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    fireEvent.change(screen.getByLabelText(`Original ZIP ${OPERATION}`), {
      target: { files: [new File(['original'], 'original.zip')] },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Resume original first attempt' }))
    await screen.findByText('Recorded, currently unavailable for downloads.')
    expect(screen.queryByRole('button', { name: 'Resume original first attempt' })).toBeNull()
    expect(screen.getByRole('button', { name: `Reconcile ${OPERATION}` })).toBeDisabled()
  })
  it('reconciles the original receipt and preserves the identity on maintenance failure', async () => {
    const client = {
      retainedReleaseOperations: vi.fn().mockResolvedValue([{ ...RECORD, action: 'delete', expected: {} }]),
      reconcileReleaseOperation: vi.fn().mockResolvedValue({ state: 'OUTCOME_UNKNOWN', effect: 'UNKNOWN' }),
      resumePreparedReleaseMaintenance: vi.fn().mockRejectedValue(new Error('unavailable')),
    }
    render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByText(OPERATION)
    fireEvent.click(screen.getByRole('button', { name: `Reconcile ${OPERATION}` }))
    await screen.findByText('OUTCOME_UNKNOWN · UNKNOWN')
    expect(client.reconcileReleaseOperation).toHaveBeenCalledWith(PRODUCT, OPERATION)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: `Resume maintenance ${OPERATION}` })).not.toBeDisabled()
    )
    fireEvent.click(screen.getByRole('button', { name: `Resume maintenance ${OPERATION}` }))
    await screen.findByRole('alert')
    expect(screen.getByText(OPERATION)).toBeTruthy()
  })
  it('ignores a late retained-operation read after product changes', async () => {
    let complete: (value: unknown) => void = () => {}
    const client = {
      retainedReleaseOperations: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            complete = resolve
          })
      ),
    }
    const view = render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    view.rerender(<ReleaseOperationRecovery client={client as unknown as Client} productId="different-product" />)
    complete([RECORD])
    await waitFor(() => expect(screen.getByRole('button', { name: 'Load retained operations' })).not.toBeDisabled())
    expect(screen.queryByText(OPERATION)).toBeNull()
  })
  it('keeps load failures explicit and renders no controls without a product', async () => {
    const client = { retainedReleaseOperations: vi.fn().mockRejectedValue(new Error('storage unavailable')) }
    const view = render(<ReleaseOperationRecovery client={client as unknown as Client} productId={PRODUCT} />)
    fireEvent.click(screen.getByRole('button', { name: 'Load retained operations' }))
    await screen.findByRole('alert')
    view.rerender(<ReleaseOperationRecovery client={client as unknown as Client} productId="" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})
