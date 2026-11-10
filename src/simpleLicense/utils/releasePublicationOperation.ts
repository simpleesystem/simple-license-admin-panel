/** Closed, nonsecret local receipt journal. Neither credentials nor artifact bytes are persisted. */
const STORAGE_PREFIX = 'sls.release-operation.v1:'
const MAX_STORAGE_KEYS = 4096
const MAX_SCOPE_RECORDS = 100
const SHA256 = /^[a-f0-9]{64}$/
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const MAX_FILE_BYTES = 100 * 1024 * 1024
const STATES = new Set([
  'RESERVED',
  'WRITE_IN_FLIGHT',
  'UPLOAD_CONFIRMED',
  'READY',
  'CONFLICT_PRESERVED',
  'OUTCOME_UNKNOWN',
  'TOMBSTONED',
  'ABORTED_NO_EFFECT',
])
const RECEIPT_FIELDS = new Set([
  'scopeFingerprint',
  'action',
  'operationId',
  'productId',
  'slug',
  'version',
  'fileName',
  'sha256',
  'sizeBytes',
  'metadataFingerprint',
  'intentHash',
  'state',
  'revision',
  'fence',
  'rowId',
  'rowRevision',
  'objectBindingFingerprint',
  'generation',
  'eligible',
  'effect',
  'reason',
  'nextAction',
])
const INVALID = 'The original release operation or its receipt could not be verified. Keep its ID and check status.'
const EXISTING = 'This version has an unresolved original operation. Check that operation before another upload.'

export interface ReleasePublicationExpected {
  rowId: string
  revision: number
  state: string
  objectBindingFingerprint: string
  liveProtectionEpoch: string | null
}

export interface ReleasePublicationReceipt {
  scopeFingerprint: string
  action: string
  operationId: string
  productId: string
  slug: string
  version: string
  fileName: string
  sha256: string
  sizeBytes: number
  metadataFingerprint: string
  intentHash: string
  state: string
  revision: number
  fence: number
  rowId: string | null
  rowRevision: number | null
  objectBindingFingerprint: string | null
  generation: string | null
  eligible: boolean
  effect: string
  reason: string
  nextAction: string
}

export interface ReleaseOperationRecord {
  scopeFingerprint?: string
  dispatchStarted?: boolean
  id: string
  scope: string
  productId: string
  action: 'create' | 'delete' | 'promote' | 'repair-missing'
  version: string
  fileName: string
  sha256: string
  sizeBytes: number
  metadataFingerprint: string
  intentFingerprint: string
  createdAt: string
  expected?: ReleasePublicationExpected
  metadata?: Record<string, string | number | boolean | null>
  receipt?: ReleasePublicationReceipt
}

export function releaseOperationScope(api: string, principal: string, productId: string): string {
  if (!api || !principal || !productId) {
    throw new Error(INVALID)
  }
  return JSON.stringify([api, principal, productId])
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(INVALID)
  }
  return value as Record<string, unknown>
}

const RECORD_FIELDS = new Set([
  'scopeFingerprint',
  'dispatchStarted',
  'id',
  'scope',
  'productId',
  'action',
  'version',
  'fileName',
  'sha256',
  'sizeBytes',
  'metadataFingerprint',
  'intentFingerprint',
  'createdAt',
  'expected',
  'metadata',
  'receipt',
])
const EXPECTED_FIELDS = new Set(['rowId', 'revision', 'state', 'objectBindingFingerprint', 'liveProtectionEpoch'])
function checkRecord(row: Record<string, unknown>): void {
  if (
    Object.keys(row).some((key) => !RECORD_FIELDS.has(key)) ||
    typeof row.id !== 'string' ||
    !UUID.test(row.id) ||
    typeof row.scope !== 'string' ||
    typeof row.productId !== 'string' ||
    !row.productId ||
    !['create', 'repair-missing', 'delete', 'promote'].includes(String(row.action)) ||
    typeof row.version !== 'string' ||
    !row.version ||
    typeof row.fileName !== 'string' ||
    !/^[A-Za-z0-9._-]+\.zip$/.test(row.fileName) ||
    typeof row.sha256 !== 'string' ||
    !SHA256.test(row.sha256) ||
    !Number.isSafeInteger(row.sizeBytes) ||
    Number(row.sizeBytes) <= 0 ||
    Number(row.sizeBytes) > MAX_FILE_BYTES ||
    typeof row.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(row.createdAt)) ||
    !['intentFingerprint', 'metadataFingerprint'].every(
      (key) => typeof row[key] === 'string' && SHA256.test(row[key])
    ) ||
    (row.scopeFingerprint !== undefined &&
      (typeof row.scopeFingerprint !== 'string' || !SHA256.test(row.scopeFingerprint))) ||
    (row.dispatchStarted !== undefined && typeof row.dispatchStarted !== 'boolean')
  ) {
    throw new Error(INVALID)
  }
  if (row.expected !== undefined) {
    const expected = object(row.expected)
    if (
      Object.keys(expected).length !== EXPECTED_FIELDS.size ||
      Object.keys(expected).some((key) => !EXPECTED_FIELDS.has(key)) ||
      typeof expected.rowId !== 'string' ||
      !expected.rowId ||
      !Number.isSafeInteger(expected.revision) ||
      Number(expected.revision) < 1 ||
      !['READY', 'LEGACY_READY'].includes(String(expected.state)) ||
      typeof expected.objectBindingFingerprint !== 'string' ||
      !SHA256.test(expected.objectBindingFingerprint) ||
      !(
        expected.liveProtectionEpoch === null ||
        (typeof expected.liveProtectionEpoch === 'string' && UUID.test(expected.liveProtectionEpoch))
      )
    ) {
      throw new Error(INVALID)
    }
  }
  if (row.metadata !== undefined) {
    const metadata = object(row.metadata)
    const nullableText: Record<string, number> = {
      changelogMd: 100000,
      minWpVersion: 100,
      testedWpVersion: 100,
      artifactManifest: 2048,
      artifactSignature: 86,
      artifactSignatureAlgorithm: 16,
      artifactSigningKeyId: 64,
    }
    const fields = new Set([
      ...Object.keys(nullableText),
      'requiredTier',
      'isPrerelease',
      'autoPromote',
      'artifactManifestVersion',
      'artifactTrust',
    ])
    if (
      Object.keys(metadata).length !== fields.size ||
      Object.keys(metadata).some((key) => !fields.has(key)) ||
      Object.entries(nullableText).some(
        ([key, max]) => metadata[key] !== null && (typeof metadata[key] !== 'string' || metadata[key].length > max)
      ) ||
      typeof metadata.requiredTier !== 'string' ||
      !metadata.requiredTier ||
      metadata.requiredTier.length > 100 ||
      typeof metadata.isPrerelease !== 'boolean' ||
      metadata.autoPromote !== false ||
      !['UNVERIFIED', 'SIGNED', 'LEGACY_ALLOWLISTED'].includes(String(metadata.artifactTrust)) ||
      (metadata.artifactManifestVersion !== null && metadata.artifactManifestVersion !== 1) ||
      (metadata.artifactSignatureAlgorithm !== null && metadata.artifactSignatureAlgorithm !== 'Ed25519')
    ) {
      throw new Error(INVALID)
    }
  }
  if (row.receipt !== undefined) {
    const { receipt, ...original } = row
    // Required record fields have been checked above; stored receipt semantics receive the same pure checks as HTTP.
    checkPublicationReceipt({ success: true, publication: receipt }, original as unknown as ReleaseOperationRecord)
  }
}

export function listReleaseOperations(scope: string, storage: Storage = localStorage): ReleaseOperationRecord[] {
  if (storage.length > MAX_STORAGE_KEYS) {
    throw new Error(INVALID)
  }
  const rows: ReleaseOperationRecord[] = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (!key?.startsWith(STORAGE_PREFIX)) {
      continue
    }
    const row = object(JSON.parse(storage.getItem(key) ?? 'null'))
    if (row.scope !== scope) {
      continue
    }
    checkRecord(row)
    rows.push(row as unknown as ReleaseOperationRecord)
  }
  if (rows.length > MAX_SCOPE_RECORDS) {
    throw new Error(INVALID)
  }
  return rows
}

export function persistReleaseOperation(record: ReleaseOperationRecord, storage: Storage = localStorage): void {
  checkRecord(record as unknown as Record<string, unknown>)
  const key = STORAGE_PREFIX + record.id
  const previous = storage.getItem(key)
  if (previous) {
    const existing = object(JSON.parse(previous))
    const next = record as unknown as Record<string, unknown>
    if (
      [...RECORD_FIELDS]
        .filter((key) => key !== 'receipt' && key !== 'dispatchStarted')
        .some((key) => JSON.stringify(existing[key]) !== JSON.stringify(next[key]))
    ) {
      throw new Error(INVALID)
    }
  } else if (listReleaseOperations(record.scope, storage).length >= MAX_SCOPE_RECORDS) {
    throw new Error(INVALID)
  }
  // A valid receipt/status update must never turn a dispatched intent back into an uploadable one.
  const retained = previous ? object(JSON.parse(previous)) : null
  if (record.receipt && retained?.receipt) {
    const previousReceipt = object(retained.receipt)
    if (
      record.receipt.intentHash !== previousReceipt.intentHash ||
      record.receipt.revision < Number(previousReceipt.revision) ||
      record.receipt.fence < Number(previousReceipt.fence)
    ) {
      throw new Error(INVALID)
    }
  }
  const next = {
    ...record,
    ...(record.receipt === undefined && retained?.receipt !== undefined ? { receipt: retained.receipt } : {}),
    ...(retained?.dispatchStarted === true ? { dispatchStarted: true } : {}),
  }
  storage.setItem(key, JSON.stringify(next))
  if (storage.getItem(key) !== JSON.stringify(next)) {
    throw new Error(INVALID)
  }
}

export function findReleaseOperation(
  scope: string,
  id: string,
  storage: Storage = localStorage
): ReleaseOperationRecord {
  const row = listReleaseOperations(scope, storage).find((record) => record.id === id)
  if (!row) {
    throw new Error(INVALID)
  }
  return row
}

export async function releaseFingerprint(value: unknown): Promise<string> {
  const normalize = (item: unknown): unknown => {
    if (Array.isArray(item)) {
      return item.map(normalize)
    }
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return Object.fromEntries(
        Object.entries(item)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, child]) => [key, normalize(child)])
      )
    }
    return item
  }
  return hashBytes(new TextEncoder().encode(JSON.stringify(normalize(value))))
}

async function fileBytes(file: File): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === 'function') {
    return new Uint8Array(await file.arrayBuffer())
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      reader.result instanceof ArrayBuffer ? resolve(new Uint8Array(reader.result)) : reject(new Error(INVALID))
    reader.onerror = () => reject(new Error(INVALID))
    reader.onabort = () => reject(new Error(INVALID))
    reader.readAsArrayBuffer(file)
  })
}

async function hashBytes(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function prepareCreateReleaseOperation(
  scope: string,
  productId: string,
  form: FormData,
  readContext: (
    id: string,
    fileName: string,
    version: string,
    isPrerelease: boolean,
    action?: 'create' | 'repair-missing' | 'delete' | 'promote',
    expected?: ReleasePublicationExpected
  ) => Promise<unknown>
): Promise<ReleaseOperationRecord> {
  const file = form.get('file')
  const version = String(form.get('version') ?? '').trim()
  if (!(file instanceof File) || file.size <= 0 || file.size > MAX_FILE_BYTES || !version) {
    throw new Error(INVALID)
  }
  const metadata = {
    changelogMd: String(form.get('changelogMd') ?? '').trim() || null,
    requiredTier: String(form.get('requiredTier') ?? '').trim() || 'FREE',
    minWpVersion: String(form.get('minWpVersion') ?? '').trim() || null,
    testedWpVersion: String(form.get('testedWpVersion') ?? '').trim() || null,
    isPrerelease: ['true', '1'].includes(String(form.get('isPrerelease'))),
    autoPromote: false,
    artifactManifest: null,
    artifactManifestVersion: null,
    artifactSignature: null,
    artifactSignatureAlgorithm: null,
    artifactSigningKeyId: null,
    artifactTrust: 'UNVERIFIED',
  }
  const sha256 = await hashBytes(await fileBytes(file))
  const metadataFingerprint = await releaseFingerprint(metadata)
  const intentFingerprint = await releaseFingerprint({
    productId,
    version,
    fileName: file.name,
    sha256,
    sizeBytes: file.size,
    metadata,
  })
  const original = form.get('operationId')
  if (typeof original === 'string' && original) {
    const retained = findReleaseOperation(scope, original)
    if (retained.intentFingerprint !== intentFingerprint) {
      throw new Error(INVALID)
    }
    if (retained.action !== 'create' || !retained.scopeFingerprint) {
      throw new Error(INVALID)
    }
    form.set('scopeFingerprint', retained.scopeFingerprint)
    form.set('fileSha256', sha256)
    return retained
  }
  if (
    listReleaseOperations(scope).some(
      (row) =>
        row.action === 'create' &&
        row.version === version &&
        row.receipt?.state !== 'READY' &&
        row.receipt?.state !== 'TOMBSTONED'
    )
  ) {
    throw new Error(EXISTING)
  }
  const id = crypto.randomUUID()
  const context = object(await readContext(id, file.name, version, metadata.isPrerelease))
  validateContext(context, productId, file.name, version)
  const record: ReleaseOperationRecord = {
    id,
    scopeFingerprint: String(context.scopeFingerprint),
    scope,
    productId,
    action: 'create',
    version,
    fileName: file.name,
    sha256,
    sizeBytes: file.size,
    metadataFingerprint,
    metadata,
    intentFingerprint,
    createdAt: new Date().toISOString(),
  }
  persistReleaseOperation(record)
  form.set('operationId', record.id)
  form.set('scopeFingerprint', String(context.scopeFingerprint))
  form.set('fileSha256', sha256)
  return record
}

const CONTEXT_FIELDS = new Set([
  'productId',
  'slug',
  'version',
  'fileName',
  'actorId',
  'publisherFingerprint',
  'namespaceFingerprint',
  'key',
  'liveProtectionEpoch',
  'scopeFingerprint',
  'writeQualified',
  'reason',
])
function validateContext(context: Record<string, unknown>, productId: string, fileName: string, version: string): void {
  if (
    Object.keys(context).length !== CONTEXT_FIELDS.size ||
    Object.keys(context).some((key) => !CONTEXT_FIELDS.has(key)) ||
    context.productId !== productId ||
    context.version !== version ||
    context.fileName !== fileName ||
    typeof context.slug !== 'string' ||
    !context.slug ||
    typeof context.actorId !== 'string' ||
    !context.actorId ||
    context.writeQualified !== true ||
    context.reason !== 'NONE' ||
    !['scopeFingerprint', 'namespaceFingerprint', 'publisherFingerprint'].every(
      (key) => typeof context[key] === 'string' && SHA256.test(context[key])
    ) ||
    !(
      context.liveProtectionEpoch === null ||
      (typeof context.liveProtectionEpoch === 'string' && UUID.test(context.liveProtectionEpoch))
    ) ||
    typeof context.key !== 'string' ||
    context.key.split('/').some((segment) => !segment || segment === '.' || segment === '..') ||
    context.key.includes('\\') ||
    !context.key.endsWith(`/${fileName}`)
  ) {
    throw new Error(INVALID)
  }
}

/** Only identical bytes of the explicitly displayed owned row can enter the separate repair route. */
export async function prepareRepairReleaseOperation(
  scope: string,
  productId: string,
  form: FormData,
  row: import('../types/api').PluginRelease,
  readContext: (
    id: string,
    fileName: string,
    version: string,
    isPrerelease: boolean,
    action?: 'create' | 'repair-missing' | 'delete' | 'promote',
    expected?: ReleasePublicationExpected
  ) => Promise<unknown>
): Promise<ReleaseOperationRecord> {
  const file = form.get('file')
  if (
    !(file instanceof File) ||
    file.name !== row.fileName ||
    file.size !== row.sizeBytes ||
    file.size <= 0 ||
    file.size > MAX_FILE_BYTES ||
    row.publicationState !== 'READY' ||
    !row.publicationOperationId ||
    !row.fileSha256 ||
    (row.artifactTrust !== 'SIGNED' && row.artifactTrust !== 'LEGACY_ALLOWLISTED')
  ) {
    throw new Error(INVALID)
  }
  const sha256 = await hashBytes(await fileBytes(file))
  if (sha256 !== row.fileSha256) {
    throw new Error(INVALID)
  }
  const expected = releaseExpected(row)
  const metadata = {
    changelogMd: row.changelogMd ?? null,
    requiredTier: row.requiredTier ?? 'FREE',
    minWpVersion: row.minWpVersion ?? null,
    testedWpVersion: row.testedWpVersion ?? null,
    isPrerelease: row.isPrerelease,
    autoPromote: false,
    artifactManifest: row.artifactManifest ?? null,
    artifactManifestVersion: row.artifactManifestVersion ?? null,
    artifactSignature: row.artifactSignature ?? null,
    artifactSignatureAlgorithm: row.artifactSignatureAlgorithm ?? null,
    artifactSigningKeyId: row.artifactSigningKeyId ?? null,
    artifactTrust: row.artifactTrust,
  }
  const intentFingerprint = await releaseFingerprint({
    productId,
    action: 'repair-missing',
    expected,
    sha256,
    metadata,
  })
  const originalId = form.get('operationId')
  if (typeof originalId === 'string' && originalId) {
    const original = findReleaseOperation(scope, originalId)
    if (original.action !== 'repair-missing' || original.intentFingerprint !== intentFingerprint) {
      throw new Error(INVALID)
    }
    return original
  }
  if (
    listReleaseOperations(scope).some(
      (record) =>
        record.action === 'repair-missing' &&
        record.expected?.rowId === row.id &&
        record.receipt?.state !== 'READY' &&
        record.receipt?.state !== 'TOMBSTONED'
    )
  ) {
    throw new Error(EXISTING)
  }
  const id = crypto.randomUUID()
  const context = object(await readContext(id, row.fileName, row.version, row.isPrerelease, 'repair-missing', expected))
  validateContext(context, productId, row.fileName, row.version)
  if (expected.liveProtectionEpoch !== context.liveProtectionEpoch) {
    throw new Error(INVALID)
  }
  const record: ReleaseOperationRecord = {
    id,
    scope,
    productId,
    action: 'repair-missing',
    version: row.version,
    fileName: row.fileName,
    sha256,
    sizeBytes: file.size,
    metadataFingerprint: await releaseFingerprint(metadata),
    metadata,
    intentFingerprint,
    scopeFingerprint: String(context.scopeFingerprint),
    expected,
    createdAt: new Date().toISOString(),
  }
  persistReleaseOperation(record)
  form.set('operationId', id)
  return record
}

export function releaseExpected(row: {
  id: string
  publicationRevision?: number
  publicationState?: string
  objectBindingFingerprint?: string | null
  liveProtectionEpoch?: string | null
}): ReleasePublicationExpected {
  if (
    !Number.isSafeInteger(row.publicationRevision) ||
    (row.publicationRevision ?? 0) <= 0 ||
    !['READY', 'LEGACY_READY'].includes(row.publicationState ?? '') ||
    !row.objectBindingFingerprint ||
    !SHA256.test(row.objectBindingFingerprint)
  ) {
    throw new Error(INVALID)
  }
  return {
    rowId: row.id,
    revision: row.publicationRevision as number,
    state: String(row.publicationState),
    objectBindingFingerprint: row.objectBindingFingerprint,
    liveProtectionEpoch: row.liveProtectionEpoch ?? null,
  }
}

export async function prepareReleaseMaintenance(
  scope: string,
  productId: string,
  action: 'delete' | 'promote',
  row: {
    id: string
    version: string
    fileName: string
    fileSha256?: string | null
    sizeBytes: number
    publicationRevision?: number
    publicationState?: string
    objectBindingFingerprint?: string | null
    liveProtectionEpoch?: string | null
    isPrerelease?: boolean
  },
  readContext: (
    id: string,
    fileName: string,
    version: string,
    isPrerelease: boolean,
    action: 'delete' | 'promote',
    expected: ReleasePublicationExpected
  ) => Promise<unknown>
): Promise<ReleaseOperationRecord> {
  const expected = releaseExpected(row)
  if (
    listReleaseOperations(scope).some(
      (record) =>
        record.action === action &&
        record.expected?.rowId === row.id &&
        record.receipt?.state !== 'READY' &&
        record.receipt?.state !== 'TOMBSTONED'
    )
  ) {
    throw new Error(EXISTING)
  }
  const metadataFingerprint = await releaseFingerprint({ expected })
  const intentFingerprint = await releaseFingerprint({ productId, action, expected })
  const id = crypto.randomUUID()
  const context = object(await readContext(id, row.fileName, row.version, row.isPrerelease ?? false, action, expected))
  validateContext(context, productId, row.fileName, row.version)
  if (context.liveProtectionEpoch !== expected.liveProtectionEpoch) {
    throw new Error(INVALID)
  }
  const record: ReleaseOperationRecord = {
    id,
    scopeFingerprint: String(context.scopeFingerprint),
    scope,
    productId,
    action,
    version: row.version,
    fileName: row.fileName,
    sha256: row.fileSha256 ?? '',
    sizeBytes: row.sizeBytes,
    metadataFingerprint,
    intentFingerprint,
    createdAt: new Date().toISOString(),
    expected,
  }
  persistReleaseOperation(record)
  return record
}

function checkPublicationReceipt(envelope: unknown, original: ReleaseOperationRecord): ReleasePublicationReceipt {
  const response = object(envelope)
  if (response.success !== true) {
    throw new Error(INVALID)
  }
  const receipt = object(response.publication)
  if (
    Object.keys(receipt).length !== RECEIPT_FIELDS.size ||
    Object.keys(receipt).some((key) => !RECEIPT_FIELDS.has(key)) ||
    receipt.operationId !== original.id ||
    receipt.productId !== original.productId ||
    receipt.action !== original.action ||
    receipt.version !== original.version ||
    receipt.fileName !== original.fileName ||
    receipt.sha256 !== original.sha256 ||
    receipt.sizeBytes !== original.sizeBytes ||
    receipt.metadataFingerprint !== original.metadataFingerprint ||
    !original.scopeFingerprint ||
    receipt.scopeFingerprint !== original.scopeFingerprint ||
    (original.receipt &&
      (receipt.intentHash !== original.receipt.intentHash ||
        Number(receipt.revision) < original.receipt.revision ||
        Number(receipt.fence) < original.receipt.fence)) ||
    ((original.action === 'delete' || original.action === 'promote') &&
      receipt.objectBindingFingerprint !== original.expected?.objectBindingFingerprint) ||
    typeof receipt.intentHash !== 'string' ||
    !SHA256.test(receipt.intentHash) ||
    typeof receipt.state !== 'string' ||
    !STATES.has(receipt.state) ||
    !Number.isSafeInteger(receipt.revision) ||
    !Number.isSafeInteger(receipt.fence) ||
    Number(receipt.revision) < 0 ||
    Number(receipt.fence) < 1 ||
    typeof receipt.scopeFingerprint !== 'string' ||
    !SHA256.test(receipt.scopeFingerprint) ||
    typeof receipt.slug !== 'string' ||
    !receipt.slug ||
    !(
      receipt.rowId === null ||
      (typeof receipt.rowId === 'string' && receipt.rowId.length > 0 && receipt.rowId.length <= 128)
    ) ||
    !(
      receipt.rowRevision === null ||
      (Number.isSafeInteger(receipt.rowRevision) && Number(receipt.rowRevision) >= 1)
    ) ||
    !(
      receipt.objectBindingFingerprint === null ||
      (typeof receipt.objectBindingFingerprint === 'string' && SHA256.test(receipt.objectBindingFingerprint))
    ) ||
    !(
      receipt.generation === null ||
      (typeof receipt.generation === 'string' && receipt.generation.length > 0 && receipt.generation.length <= 256)
    ) ||
    typeof receipt.eligible !== 'boolean' ||
    !['NOT_DISPATCHED', 'CONFIRMED', 'UNKNOWN', 'OBJECT_RETAINED'].includes(String(receipt.effect)) ||
    typeof receipt.reason !== 'string' ||
    !/^[A-Z][A-Z0-9_]{0,95}$/.test(receipt.reason) ||
    !['NONE', 'STATUS', 'RECONCILE', 'FIRST_ATTEMPT'].includes(String(receipt.nextAction)) ||
    (receipt.eligible === true && (receipt.state !== 'READY' || receipt.effect !== 'CONFIRMED')) ||
    (receipt.state === 'TOMBSTONED' && (receipt.eligible !== false || receipt.effect !== 'OBJECT_RETAINED')) ||
    (receipt.state === 'READY' && receipt.effect !== 'CONFIRMED') ||
    (receipt.state === 'RESERVED' && receipt.effect !== 'NOT_DISPATCHED')
  ) {
    throw new Error(INVALID)
  }
  if (receipt.state === 'READY' || receipt.state === 'TOMBSTONED') {
    if (
      typeof receipt.rowId !== 'string' ||
      !receipt.rowId ||
      !Number.isSafeInteger(receipt.rowRevision) ||
      typeof receipt.objectBindingFingerprint !== 'string' ||
      !SHA256.test(receipt.objectBindingFingerprint) ||
      typeof receipt.generation !== 'string' ||
      !receipt.generation ||
      (original.expected && receipt.rowId !== original.expected.rowId)
    ) {
      throw new Error(INVALID)
    }
  }
  return receipt as unknown as ReleasePublicationReceipt
}

export function validatePublicationReceipt(
  envelope: unknown,
  original: ReleaseOperationRecord
): ReleasePublicationReceipt {
  const validated = checkPublicationReceipt(envelope, original)
  persistReleaseOperation({ ...original, receipt: validated })
  return validated
}

export function verifyPreparedMaintenanceContext(original: ReleaseOperationRecord, value: unknown): void {
  const context = object(value)
  validateContext(context, original.productId, original.fileName, original.version)
  if (
    !original.expected ||
    context.scopeFingerprint !== original.scopeFingerprint ||
    context.liveProtectionEpoch !== original.expected.liveProtectionEpoch ||
    (original.action !== 'delete' && original.action !== 'promote')
  ) {
    throw new Error(INVALID)
  }
}
