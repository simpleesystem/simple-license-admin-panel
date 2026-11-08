import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  listReleaseOperations,
  persistReleaseOperation,
  prepareCreateReleaseOperation,
  prepareReleaseMaintenance,
  prepareRepairReleaseOperation,
  releaseExpected,
  releaseFingerprint,
  releaseOperationScope,
  validatePublicationReceipt,
  verifyPreparedMaintenanceContext,
} from '../../src/simpleLicense/utils/releasePublicationOperation'
import { buildRelease } from '../factories/releaseFactory'

const TEST_API = 'https://publication.invalid'
const TEST_PRINCIPAL = 'synthetic-principal'
const TEST_PRODUCT = 'synthetic-product'
const TEST_VERSION = '1.0.0'
const TEST_DIGEST = 'a'.repeat(64)
const TEST_BINDING = 'b'.repeat(64)
const TEST_FILE = 'synthetic.zip'
const TEST_SIZE = 8

const fixture = () => ({
  id: crypto.randomUUID(),
  scopeFingerprint: TEST_DIGEST,
  scope: releaseOperationScope(TEST_API, TEST_PRINCIPAL, TEST_PRODUCT),
  productId: TEST_PRODUCT,
  action: 'create' as const,
  version: TEST_VERSION,
  fileName: TEST_FILE,
  sha256: TEST_DIGEST,
  sizeBytes: TEST_SIZE,
  metadataFingerprint: TEST_DIGEST,
  intentFingerprint: TEST_BINDING,
  createdAt: new Date().toISOString(),
})

describe('Durable original release-operation identity', () => {
  beforeEach(() => localStorage.clear())
  it('refuses unrecognized journal metadata before any persistence', () => {
    const record = fixture()
    expect(() => persistReleaseOperation({ ...record, metadata: { unexpected: 'unrecognized' } })).toThrow()
    expect(localStorage.length).toBe(0)
  })
  it.each([
    'operationId',
    'sha256',
    'state',
  ])('rejects a malformed stored %s receipt on reload and direct persistence', (field) => {
    const record = fixture()
    const receipt = {
      scopeFingerprint: record.scopeFingerprint,
      action: record.action,
      operationId: record.id,
      productId: record.productId,
      slug: 'synthetic',
      version: record.version,
      fileName: record.fileName,
      sha256: record.sha256,
      sizeBytes: record.sizeBytes,
      metadataFingerprint: record.metadataFingerprint,
      intentHash: TEST_BINDING,
      state: 'READY',
      revision: 4,
      fence: 1,
      rowId: 'row',
      rowRevision: 1,
      objectBindingFingerprint: TEST_BINDING,
      generation: 'generation',
      eligible: true,
      effect: 'CONFIRMED',
      reason: 'NONE',
      nextAction: 'NONE',
    }
    validatePublicationReceipt({ success: true, publication: receipt }, record)
    const invalid = { ...receipt, [field]: field === 'state' ? 'OUTCOME_UNKNOWN' : 'mismatched' }
    expect(() => persistReleaseOperation({ ...record, receipt: invalid })).toThrow()
    const key = localStorage.key(0)
    if (!key) {
      throw new Error('Missing persisted fixture')
    }
    localStorage.setItem(key, JSON.stringify({ ...record, receipt: invalid }))
    expect(() => listReleaseOperations(record.scope)).toThrow()
  })
  it('retains separate identities for two tabs instead of using a version-keyed slot', () => {
    const first = fixture()
    const second = fixture()
    persistReleaseOperation(first)
    persistReleaseOperation(second)
    expect(listReleaseOperations(first.scope).map((row) => row.id)).toEqual([first.id, second.id])
  })
  it('refuses changed intent under the same original ID', () => {
    const record = fixture()
    persistReleaseOperation(record)
    expect(() => persistReleaseOperation({ ...record, intentFingerprint: TEST_DIGEST })).toThrow()
  })
  it('keeps response loss unresolved after a reload', () => {
    const record = fixture()
    persistReleaseOperation(record)
    expect(listReleaseOperations(record.scope)).toEqual([record])
  })
  it('does not treat an HTTP success with missing receipt fields as a READY operation', () => {
    const record = fixture()
    expect(() => validatePublicationReceipt({ success: true, data: {} }, record)).toThrow()
  })
  it('does not replace the retained principal or product from response labels', () => {
    const record = fixture()
    expect(() =>
      validatePublicationReceipt(
        {
          success: true,
          publication: {
            operationId: record.id,
            productId: crypto.randomUUID(),
            state: 'READY',
            eligible: true,
          },
        },
        record
      )
    ).toThrow()
  })
  it('never clears a dispatched flag when a valid nonterminal receipt is saved from an earlier record', () => {
    const record = fixture()
    persistReleaseOperation({ ...record, dispatchStarted: true })
    const receipt = {
      scopeFingerprint: record.scopeFingerprint,
      action: record.action,
      operationId: record.id,
      productId: record.productId,
      slug: 'synthetic',
      version: record.version,
      fileName: record.fileName,
      sha256: record.sha256,
      sizeBytes: record.sizeBytes,
      metadataFingerprint: record.metadataFingerprint,
      intentHash: TEST_BINDING,
      state: 'OUTCOME_UNKNOWN',
      revision: 3,
      fence: 2,
      rowId: null,
      rowRevision: null,
      objectBindingFingerprint: null,
      generation: null,
      eligible: false,
      effect: 'UNKNOWN',
      reason: 'OUTCOME_UNKNOWN',
      nextAction: 'RECONCILE',
    }
    validatePublicationReceipt({ success: true, publication: receipt }, record)
    expect(listReleaseOperations(record.scope)[0]?.dispatchStarted).toBe(true)
  })
  it('refuses missing receipt fields, impossible eligibility and changed original intent hashes', () => {
    const record = fixture()
    persistReleaseOperation(record)
    const receipt = {
      scopeFingerprint: record.scopeFingerprint,
      action: record.action,
      operationId: record.id,
      productId: record.productId,
      slug: 'synthetic',
      version: record.version,
      fileName: record.fileName,
      sha256: record.sha256,
      sizeBytes: record.sizeBytes,
      metadataFingerprint: record.metadataFingerprint,
      intentHash: TEST_BINDING,
      state: 'RESERVED',
      revision: 0,
      fence: 1,
      rowId: null,
      rowRevision: null,
      objectBindingFingerprint: null,
      generation: null,
      eligible: false,
      effect: 'NOT_DISPATCHED',
      reason: 'NONE',
      nextAction: 'FIRST_ATTEMPT',
    }
    const validated = validatePublicationReceipt({ success: true, publication: receipt }, record)
    for (const mutation of [
      { ...receipt, eligible: true },
      { ...receipt, generation: undefined },
      { ...receipt, intentHash: TEST_DIGEST },
    ]) {
      expect(() =>
        validatePublicationReceipt({ success: true, publication: mutation }, { ...record, receipt: validated })
      ).toThrow()
    }
  })
  it('prepares and resumes the same browser FileReader-backed file, refusing a replacement file', async () => {
    const form = new FormData()
    form.set('file', new File(['synthetic'], TEST_FILE))
    form.set('version', TEST_VERSION)
    const scope = releaseOperationScope(TEST_API, TEST_PRINCIPAL, TEST_PRODUCT)
    const readContext = async () => ({
      productId: TEST_PRODUCT,
      slug: 'synthetic',
      version: TEST_VERSION,
      fileName: TEST_FILE,
      actorId: TEST_PRINCIPAL,
      publisherFingerprint: TEST_DIGEST,
      namespaceFingerprint: TEST_BINDING,
      key: `releases/${TEST_FILE}`,
      liveProtectionEpoch: null,
      scopeFingerprint: TEST_DIGEST,
      writeQualified: true,
      reason: 'NONE',
    })
    const original = await prepareCreateReleaseOperation(scope, TEST_PRODUCT, form, readContext)
    expect(
      await prepareCreateReleaseOperation(scope, TEST_PRODUCT, form, async () => {
        throw new Error('A resumed intent must not mint another context')
      })
    ).toEqual(original)
    expect(original.metadataFingerprint).toBe(await releaseFingerprint(original.metadata))
    form.set('file', new File(['replacement'], TEST_FILE))
    await expect(prepareCreateReleaseOperation(scope, TEST_PRODUCT, form, readContext)).rejects.toThrow()
  })
  it('refuses closed-context extras before any journal or form operation ID is stored', async () => {
    const form = new FormData()
    form.set('file', new File(['synthetic'], TEST_FILE))
    form.set('version', TEST_VERSION)
    const scope = releaseOperationScope(TEST_API, TEST_PRINCIPAL, TEST_PRODUCT)
    await expect(
      prepareCreateReleaseOperation(scope, TEST_PRODUCT, form, async () => ({
        productId: TEST_PRODUCT,
        unadmitted: true,
      }))
    ).rejects.toThrow()
    expect(form.get('operationId')).toBeNull()
    expect(listReleaseOperations(scope)).toEqual([])
  })
})

describe('Repair and maintenance preserve the selected original artifact and epoch', () => {
  beforeEach(() => localStorage.clear())
  const prepare = async () => {
    const bytes = new TextEncoder().encode('synthetic')
    const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('')
    const row = buildRelease({
      id: 'selected-row',
      version: TEST_VERSION,
      fileName: TEST_FILE,
      sizeBytes: bytes.length,
      fileSha256: sha256,
      publicationState: 'READY',
      publicationRevision: 2,
      publicationOperationId: 'original-writer',
      objectBindingFingerprint: TEST_BINDING,
      liveProtectionEpoch: null,
      artifactTrust: 'SIGNED',
      artifactManifest: 'retained-manifest',
      artifactSignature: 'retained-signature',
      artifactManifestVersion: 1,
      artifactSignatureAlgorithm: 'Ed25519',
      artifactSigningKeyId: 'retained-key',
    })
    const form = new FormData()
    form.set('file', new File([bytes], TEST_FILE))
    const context = {
      productId: TEST_PRODUCT,
      slug: row.slug,
      version: row.version,
      fileName: row.fileName,
      actorId: TEST_PRINCIPAL,
      publisherFingerprint: TEST_DIGEST,
      namespaceFingerprint: TEST_BINDING,
      key: `releases/${TEST_FILE}`,
      liveProtectionEpoch: null,
      scopeFingerprint: TEST_DIGEST,
      writeQualified: true,
      reason: 'NONE',
    }
    const scope = releaseOperationScope(TEST_API, TEST_PRINCIPAL, TEST_PRODUCT)
    return { row, form, context, scope }
  }
  it('retains the exact signed metadata and reopens only the same undispatched repair identity', async () => {
    const f = await prepare()
    const read = vi.fn().mockResolvedValue(f.context)
    const original = await prepareRepairReleaseOperation(f.scope, TEST_PRODUCT, f.form, f.row, read)
    expect(original.expected).toEqual(releaseExpected(f.row))
    expect(original.metadata).toMatchObject({
      artifactSignature: f.row.artifactSignature,
      artifactTrust: 'SIGNED',
      autoPromote: false,
    })
    expect(await prepareRepairReleaseOperation(f.scope, TEST_PRODUCT, f.form, f.row, read)).toEqual(original)
    expect(read).toHaveBeenCalledTimes(1)
    expect(listReleaseOperations(f.scope)).toEqual([original])
    const otherForm = new FormData()
    otherForm.set('file', f.form.get('file') as File)
    await expect(prepareRepairReleaseOperation(f.scope, TEST_PRODUCT, otherForm, f.row, read)).rejects.toThrow(
      'unresolved original'
    )
    expect(read).toHaveBeenCalledTimes(1)
  })
  it.each([
    'different-name',
    'different-size',
    'different-hash',
    'pending',
    'no-owner',
    'unverified',
  ])('refuses %s before asking for a repair context', async (kind) => {
    const f = await prepare()
    const read = vi.fn().mockResolvedValue(f.context)
    if (kind === 'different-name') {
      f.form.set('file', new File(['synthetic'], 'other.zip'))
    }
    if (kind === 'different-size') {
      f.form.set('file', new File(['other'], TEST_FILE))
    }
    if (kind === 'different-hash') {
      f.form.set('file', new File(['different'], TEST_FILE))
    }
    if (kind === 'pending') {
      f.row.publicationState = 'PENDING'
    }
    if (kind === 'no-owner') {
      f.row.publicationOperationId = null
    }
    if (kind === 'unverified') {
      f.row.artifactTrust = 'UNVERIFIED'
    }
    await expect(prepareRepairReleaseOperation(f.scope, TEST_PRODUCT, f.form, f.row, read)).rejects.toThrow()
    expect(read).not.toHaveBeenCalled()
    expect(listReleaseOperations(f.scope)).toEqual([])
  })
  it.each([
    'epoch-changed',
    'unqualified',
    'wrong-product',
    'unsafe-key',
  ])('refuses %s context without persisting a repair', async (kind) => {
    const f = await prepare()
    const context = {
      ...f.context,
      liveProtectionEpoch: kind === 'epoch-changed' ? crypto.randomUUID() : null,
      writeQualified: kind !== 'unqualified',
      productId: kind === 'wrong-product' ? 'other-product' : TEST_PRODUCT,
      key: kind === 'unsafe-key' ? `releases/../${TEST_FILE}` : f.context.key,
    }
    await expect(
      prepareRepairReleaseOperation(f.scope, TEST_PRODUCT, f.form, f.row, async () => context)
    ).rejects.toThrow()
    expect(listReleaseOperations(f.scope)).toEqual([])
    expect(f.form.get('operationId')).toBeNull()
  })
  it('refuses reuse of a repair ID after its exact selected revision or retained metadata changes', async () => {
    const f = await prepare()
    const original = await prepareRepairReleaseOperation(f.scope, TEST_PRODUCT, f.form, f.row, async () => f.context)
    await expect(
      prepareRepairReleaseOperation(
        f.scope,
        TEST_PRODUCT,
        f.form,
        { ...f.row, publicationRevision: 3 },
        async () => f.context
      )
    ).rejects.toThrow()
    await expect(
      prepareRepairReleaseOperation(
        f.scope,
        TEST_PRODUCT,
        f.form,
        { ...f.row, artifactSignature: 'changed-signature' },
        async () => f.context
      )
    ).rejects.toThrow()
    expect(listReleaseOperations(f.scope)).toEqual([original])
  })
  it('prepares a separate maintenance ID, refuses duplicate preparation, and revalidates its original context', async () => {
    const f = await prepare()
    const read = vi.fn().mockResolvedValue(f.context)
    const original = await prepareReleaseMaintenance(f.scope, TEST_PRODUCT, 'delete', f.row, read)
    verifyPreparedMaintenanceContext(original, f.context)
    expect(original.action).toBe('delete')
    expect(original.expected).toEqual(releaseExpected(f.row))
    await expect(prepareReleaseMaintenance(f.scope, TEST_PRODUCT, 'delete', f.row, read)).rejects.toThrow(
      'unresolved original'
    )
    expect(read).toHaveBeenCalledTimes(1)
    expect(() => verifyPreparedMaintenanceContext(original, { ...f.context, scopeFingerprint: TEST_BINDING })).toThrow()
    expect(() =>
      verifyPreparedMaintenanceContext(original, { ...f.context, liveProtectionEpoch: crypto.randomUUID() })
    ).toThrow()
    expect(() => releaseExpected({ ...f.row, publicationRevision: 0 })).toThrow()
  })
  it('rejects stale maintenance epoch before creating a journal entry', async () => {
    const f = await prepare()
    await expect(
      prepareReleaseMaintenance(f.scope, TEST_PRODUCT, 'promote', f.row, async () => ({
        ...f.context,
        liveProtectionEpoch: crypto.randomUUID(),
      }))
    ).rejects.toThrow()
    expect(listReleaseOperations(f.scope)).toEqual([])
  })
  it('fingerprints nested metadata independently of key order while preserving array order', async () => {
    expect(await releaseFingerprint({ b: [2, { z: 3, a: 1 }], a: null })).toBe(
      await releaseFingerprint({ a: null, b: [2, { a: 1, z: 3 }] })
    )
    expect(await releaseFingerprint([1, 2])).not.toBe(await releaseFingerprint([2, 1]))
  })
  it('refuses journal quota exhaustion and failed durable readback instead of returning a dispatchable ID', () => {
    const record = fixture()
    for (let index = 0; index < 100; index += 1) {
      persistReleaseOperation({ ...record, id: crypto.randomUUID() })
    }
    expect(() => persistReleaseOperation(record)).toThrow()
    localStorage.clear()
    const storage: Storage = {
      length: 0,
      clear() {},
      key() {
        return null
      },
      getItem() {
        return null
      },
      removeItem() {},
      setItem() {},
    }
    expect(() => persistReleaseOperation(record, storage)).toThrow()
    for (let index = 0; index < 4097; index += 1) {
      localStorage.setItem(`unrelated-${index}`, 'unrelated')
    }
    expect(() => listReleaseOperations(record.scope)).toThrow()
  })
})
