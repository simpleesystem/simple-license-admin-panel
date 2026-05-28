import { QueryClientContext } from '@tanstack/react-query'
import { type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { DEFAULT_NOTIFICATION_EVENT, NOTIFICATION_VARIANT_ERROR, NOTIFICATION_VARIANT_SUCCESS } from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import type { AgentServiceAccount, AgentServiceCredential, Client } from '@/simpleLicense'
import {
  useAdminAgentServiceAccounts,
  useIssueAgentServiceCredential,
  useRevokeAgentServiceCredential,
  useUpdateAgentServiceAccount,
} from '@/simpleLicense'
import {
  UI_ACTION_CANCEL,
  UI_ACTION_CLOSE,
  UI_AGENT_SERVICE_ACCOUNT_ACTION_EDIT,
  UI_AGENT_SERVICE_ACCOUNT_ACTION_ISSUE_CREDENTIAL,
  UI_AGENT_SERVICE_ACCOUNT_ACTION_VIEW_CREDENTIALS,
  UI_AGENT_SERVICE_ACCOUNT_COLUMN_ACTIONS,
  UI_AGENT_SERVICE_ACCOUNT_COLUMN_LAST_USED,
  UI_AGENT_SERVICE_ACCOUNT_COLUMN_NAME,
  UI_AGENT_SERVICE_ACCOUNT_COLUMN_SCOPE,
  UI_AGENT_SERVICE_ACCOUNT_COLUMN_STATUS,
  UI_AGENT_SERVICE_ACCOUNT_COLUMN_VENDOR,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_ACTIONS,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_CLIENT_ID,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_CREATED,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_EXPIRES,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_NAME,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_REVOKED,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_SCOPES,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_EMPTY_STATE,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_ACTIVE,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_ALL,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_EXPIRED,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_LABEL,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_REVOKED,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ACTIVE,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ALL,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_EXPIRED,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_REVOKED,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_CLIENT_ID,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_CLIENT_SECRET,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SEARCH_LABEL,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SEARCH_PLACEHOLDER,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_LABEL,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_NEWEST,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_OLDEST,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_NEWEST,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_OLDEST,
  UI_AGENT_SERVICE_ACCOUNT_EMPTY_STATE,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_CREDENTIAL_NAME,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_DESCRIPTION,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_EXPIRES_AT,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_NAME,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_SCOPES,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_STATUS,
  UI_AGENT_SERVICE_ACCOUNT_MODAL_CREDENTIAL_HISTORY_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_MODAL_EDIT_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_MODAL_ISSUE_CREDENTIAL_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_PANEL_DESCRIPTION,
  UI_AGENT_SERVICE_ACCOUNT_PANEL_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM,
  UI_AGENT_SERVICE_ACCOUNT_STATUS_ACTIVE,
  UI_AGENT_SERVICE_ACCOUNT_STATUS_DISABLED,
  UI_AGENT_SERVICE_ACCOUNT_STATUS_LABEL_ACTIVE,
  UI_AGENT_SERVICE_ACCOUNT_STATUS_LABEL_DISABLED,
  UI_AGENT_SERVICE_ACCOUNT_SUBMIT_ISSUE,
  UI_AGENT_SERVICE_ACCOUNT_SUBMIT_REVOKE,
  UI_AGENT_SERVICE_ACCOUNT_SUBMIT_UPDATE,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_ISSUE_ERROR,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_ISSUE_SUCCESS,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_ERROR,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_SUCCESS,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_UPDATE_ERROR,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_UPDATE_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_STACK_GAP_MEDIUM,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { TableControls } from '../data/TableControls'
import { TABLE_BATCH_TABLE_AGENT_CREDENTIALS, useTableBatchBus } from '../data/tableBatchBus'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiDataTableColumn, UiDataTableSelection } from '../types'
import { formatDateSafe } from '../utils/formatUtils'

type AgentServiceAccountsPanelProps = {
  client: Client
  currentUserVendorId?: string | null
  currentUserRole?: string | null
  tenantNameById: Record<string, string>
}

type CredentialResult = {
  clientId: string
  clientSecret: string
}

type AccountStatus = 'ACTIVE' | 'DISABLED'
type CredentialStatusFilter = 'ALL' | 'ACTIVE' | 'REVOKED' | 'EXPIRED'
type CredentialSortOrder = 'NEWEST' | 'OLDEST'

export function AgentServiceAccountsPanel({
  client,
  currentUserVendorId,
  currentUserRole,
  tenantNameById,
}: AgentServiceAccountsPanelProps) {
  const queryClient = useContext(QueryClientContext)
  if (!queryClient) {
    return null
  }
  return (
    <AgentServiceAccountsPanelWithQuery
      client={client}
      currentUserVendorId={currentUserVendorId}
      currentUserRole={currentUserRole}
      tenantNameById={tenantNameById}
    />
  )
}

function AgentServiceAccountsPanelWithQuery({
  client,
  currentUserVendorId,
  currentUserRole,
  tenantNameById,
}: AgentServiceAccountsPanelProps) {
  const [selectedAccount, setSelectedAccount] = useState<AgentServiceAccount | null>(null)
  const [historyAccount, setHistoryAccount] = useState<AgentServiceAccount | null>(null)
  const [editingAccount, setEditingAccount] = useState<AgentServiceAccount | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingStatus, setEditingStatus] = useState<AccountStatus>(UI_AGENT_SERVICE_ACCOUNT_STATUS_ACTIVE)
  const [credentialName, setCredentialName] = useState('')
  const [scopesInput, setScopesInput] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [credentialResult, setCredentialResult] = useState<CredentialResult | null>(null)
  const [credentialStatusFilter, setCredentialStatusFilter] = useState<CredentialStatusFilter>(
    UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ALL
  )
  const [credentialSearchTerm, setCredentialSearchTerm] = useState('')
  const [credentialSortOrder, setCredentialSortOrder] = useState<CredentialSortOrder>(
    UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_NEWEST
  )
  const notificationBus = useNotificationBus()
  const canManageSystemAccounts = currentUserRole === 'SUPERUSER' || currentUserRole === 'ADMIN'
  const effectiveVendorFilter = canManageSystemAccounts ? null : (currentUserVendorId ?? null)
  const listQuery = useAdminAgentServiceAccounts(client, effectiveVendorFilter)
  const issueMutation = useIssueAgentServiceCredential(client)
  const revokeMutation = useRevokeAgentServiceCredential(client)
  const updateMutation = useUpdateAgentServiceAccount(client)

  const rows = useMemo<AgentServiceAccount[]>(() => listQuery.data ?? [], [listQuery.data])
  const issueButtonDisabled = issueMutation.isPending || credentialName.trim().length === 0

  const resetEditingState = useCallback(() => {
    setEditingAccount(null)
    setEditingName('')
    setEditingDescription('')
    setEditingStatus(UI_AGENT_SERVICE_ACCOUNT_STATUS_ACTIVE)
  }, [])

  const openEditModal = useCallback((account: AgentServiceAccount) => {
    setEditingAccount(account)
    setEditingName(account.name)
    setEditingDescription(account.description ?? '')
    setEditingStatus(
      account.status === UI_AGENT_SERVICE_ACCOUNT_STATUS_DISABLED
        ? UI_AGENT_SERVICE_ACCOUNT_STATUS_DISABLED
        : UI_AGENT_SERVICE_ACCOUNT_STATUS_ACTIVE
    )
  }, [])

  const resetIssueState = useCallback(() => {
    setSelectedAccount(null)
    setCredentialName('')
    setScopesInput('')
    setExpiresAt('')
    setCredentialResult(null)
  }, [])

  const openIssueModal = useCallback((account: AgentServiceAccount) => {
    setSelectedAccount(account)
    setCredentialName('')
    setScopesInput('')
    setExpiresAt('')
    setCredentialResult(null)
  }, [])

  const openHistoryModal = useCallback((account: AgentServiceAccount) => {
    setHistoryAccount(account)
    setCredentialStatusFilter(UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ALL)
    setCredentialSearchTerm('')
    setCredentialSortOrder(UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_NEWEST)
  }, [])

  const columns: UiDataTableColumn<AgentServiceAccount>[] = useMemo(
    () => [
      {
        id: 'agent-service-account-name',
        header: UI_AGENT_SERVICE_ACCOUNT_COLUMN_NAME,
        cell: (row) => row.name,
      },
      {
        id: 'agent-service-account-scope',
        header: UI_AGENT_SERVICE_ACCOUNT_COLUMN_SCOPE,
        cell: (row) => row.scopeMode,
      },
      {
        id: 'agent-service-account-vendor',
        header: UI_AGENT_SERVICE_ACCOUNT_COLUMN_VENDOR,
        cell: (row) => {
          if (row.scopeMode === UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM) {
            return UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM
          }
          return tenantNameById[row.vendorId ?? ''] ?? row.vendorId ?? UI_VALUE_PLACEHOLDER
        },
      },
      {
        id: 'agent-service-account-status',
        header: UI_AGENT_SERVICE_ACCOUNT_COLUMN_STATUS,
        cell: (row) => row.status ?? UI_VALUE_PLACEHOLDER,
      },
      {
        id: 'agent-service-account-last-used',
        header: UI_AGENT_SERVICE_ACCOUNT_COLUMN_LAST_USED,
        cell: (row) => formatDateSafe(row.lastUsedAt ?? null),
      },
      {
        id: 'agent-service-account-actions',
        header: UI_AGENT_SERVICE_ACCOUNT_COLUMN_ACTIONS,
        cell: (row) => (
          <AgentServiceAccountRowActions
            onEdit={() => openEditModal(row)}
            onIssueCredential={() => openIssueModal(row)}
            onViewCredentials={() => openHistoryModal(row)}
          />
        ),
      },
    ],
    [openEditModal, openHistoryModal, openIssueModal, tenantNameById]
  )

  const credentialsForHistory = useMemo<AgentServiceCredential[]>(() => {
    const credentials = historyAccount?.credentials ?? []
    const filteredByStatus = credentials.filter((credential) => {
      if (credentialStatusFilter === UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ACTIVE) {
        return !credential.revokedAt && !isCredentialExpired(credential)
      }
      if (credentialStatusFilter === UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_REVOKED) {
        return Boolean(credential.revokedAt)
      }
      if (credentialStatusFilter === UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_EXPIRED) {
        return !credential.revokedAt && isCredentialExpired(credential)
      }
      return true
    })

    const normalizedSearch = credentialSearchTerm.trim().toLowerCase()
    const filteredBySearch =
      normalizedSearch.length === 0
        ? filteredByStatus
        : filteredByStatus.filter((credential) => {
            return (
              credential.credentialName.toLowerCase().includes(normalizedSearch) ||
              credential.clientId.toLowerCase().includes(normalizedSearch)
            )
          })

    return filteredBySearch.slice().sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime()
      const rightTime = new Date(right.createdAt).getTime()
      if (credentialSortOrder === UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_OLDEST) {
        return leftTime - rightTime
      }
      return rightTime - leftTime
    })
  }, [credentialSearchTerm, credentialSortOrder, credentialStatusFilter, historyAccount?.credentials])

  const refreshCredentialHistory = useCallback(async () => {
    const result = await listQuery.refetch()
    const accounts = result.data ?? listQuery.data ?? []
    const refreshed = accounts.find((account) => account.id === historyAccount?.id) ?? null
    setHistoryAccount(refreshed)
  }, [historyAccount?.id, listQuery])

  const { selection, batchBar, clearSelection } = useTableBatchBus<
    AgentServiceCredential,
    typeof TABLE_BATCH_TABLE_AGENT_CREDENTIALS
  >({
    tableId: TABLE_BATCH_TABLE_AGENT_CREDENTIALS,
    enabled: Boolean(historyAccount),
    visibleRows: credentialsForHistory,
    rowKey: (row) => row.id,
    context: { client, onRefresh: () => void refreshCredentialHistory() },
  })

  useEffect(() => {
    clearSelection()
  }, [clearSelection])

  const handleRevokeCredential = useCallback(
    async (credentialId: string) => {
      try {
        await revokeMutation.mutateAsync(credentialId)
        notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
          titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_SUCCESS,
          variant: NOTIFICATION_VARIANT_SUCCESS,
        })
        await refreshCredentialHistory()
      } catch {
        notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
          titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_ERROR,
          variant: NOTIFICATION_VARIANT_ERROR,
        })
      }
    },
    [notificationBus, refreshCredentialHistory, revokeMutation]
  )

  const credentialHistoryColumns: UiDataTableColumn<AgentServiceCredential>[] = useMemo(
    () => [
      {
        id: 'agent-credential-name',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_NAME,
        cell: (row) => row.credentialName,
      },
      {
        id: 'agent-credential-client-id',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_CLIENT_ID,
        cell: (row) => row.clientId,
        truncate: true,
      },
      {
        id: 'agent-credential-scopes',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_SCOPES,
        cell: (row) => row.scopes.join(', '),
        truncate: true,
        truncateMaxWidth: '18rem',
      },
      {
        id: 'agent-credential-created',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_CREATED,
        cell: (row) => formatDateSafe(row.createdAt),
      },
      {
        id: 'agent-credential-expires',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_EXPIRES,
        cell: (row) => formatDateSafe(row.expiresAt ?? null),
      },
      {
        id: 'agent-credential-revoked',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_REVOKED,
        cell: (row) => formatDateSafe(row.revokedAt ?? null),
      },
      {
        id: 'agent-credential-actions',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_ACTIONS,
        cell: (row) =>
          row.revokedAt ? (
            UI_VALUE_PLACEHOLDER
          ) : (
            <Button
              variant={UI_BUTTON_VARIANT_SECONDARY}
              disabled={revokeMutation.isPending}
              onClick={() => {
                void handleRevokeCredential(row.id)
              }}
            >
              {UI_AGENT_SERVICE_ACCOUNT_SUBMIT_REVOKE}
            </Button>
          ),
      },
    ],
    [handleRevokeCredential, revokeMutation.isPending]
  )

  const handleIssueCredential = async () => {
    if (!selectedAccount || credentialName.trim().length === 0) {
      return
    }

    const scopes = scopesInput
      .split(',')
      .map((scope) => scope.trim())
      .filter((scope) => scope.length > 0)
    try {
      const response = await issueMutation.mutateAsync({
        serviceAccountId: selectedAccount.id,
        request: {
          credentialName: credentialName.trim(),
          ...(scopes.length > 0 ? { scopes } : {}),
          ...(expiresAt.trim().length > 0 ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        },
      })
      setCredentialResult({
        clientId: response.data.clientId,
        clientSecret: response.data.clientSecret,
      })
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_ISSUE_SUCCESS,
        variant: NOTIFICATION_VARIANT_SUCCESS,
      })
    } catch {
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_ISSUE_ERROR,
        variant: NOTIFICATION_VARIANT_ERROR,
      })
    }
  }

  const canSubmitEdit = editingAccount !== null && editingName.trim().length > 0 && !updateMutation.isPending

  const handleUpdateAccount = async () => {
    if (!editingAccount || !canSubmitEdit) {
      return
    }

    const nextName = editingName.trim()
    const nextDescription = editingDescription.trim()

    try {
      await updateMutation.mutateAsync({
        serviceAccountId: editingAccount.id,
        request: {
          name: nextName,
          description: nextDescription.length > 0 ? nextDescription : null,
          status: editingStatus,
        },
      })
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_UPDATE_SUCCESS,
        variant: NOTIFICATION_VARIANT_SUCCESS,
      })
      resetEditingState()
    } catch {
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_UPDATE_ERROR,
        variant: NOTIFICATION_VARIANT_ERROR,
      })
    }
  }

  return (
    <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
      <PanelHeader
        title={UI_AGENT_SERVICE_ACCOUNT_PANEL_TITLE}
        description={UI_AGENT_SERVICE_ACCOUNT_PANEL_DESCRIPTION}
      />
      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        emptyState={UI_AGENT_SERVICE_ACCOUNT_EMPTY_STATE}
        isLoading={listQuery.isLoading}
      />
      <EditServiceAccountModal
        show={Boolean(editingAccount)}
        editingName={editingName}
        editingDescription={editingDescription}
        editingStatus={editingStatus}
        onNameChange={setEditingName}
        onDescriptionChange={setEditingDescription}
        onStatusChange={setEditingStatus}
        onClose={resetEditingState}
        onSave={() => {
          void handleUpdateAccount()
        }}
        isPending={updateMutation.isPending}
        canSubmit={canSubmitEdit}
      />
      <IssueCredentialModal
        show={Boolean(selectedAccount)}
        credentialName={credentialName}
        scopesInput={scopesInput}
        expiresAt={expiresAt}
        credentialResult={credentialResult}
        onCredentialNameChange={setCredentialName}
        onScopesInputChange={setScopesInput}
        onExpiresAtChange={setExpiresAt}
        onClose={resetIssueState}
        onIssue={() => {
          void handleIssueCredential()
        }}
        issuePending={issueMutation.isPending}
        issueButtonDisabled={issueButtonDisabled}
      />
      <CredentialHistoryModal
        show={Boolean(historyAccount)}
        credentialStatusFilter={credentialStatusFilter}
        credentialSearchTerm={credentialSearchTerm}
        credentialSortOrder={credentialSortOrder}
        onStatusFilterChange={setCredentialStatusFilter}
        onSearchTermChange={setCredentialSearchTerm}
        onSortOrderChange={setCredentialSortOrder}
        batchBar={batchBar}
        credentials={credentialsForHistory}
        columns={credentialHistoryColumns}
        selection={selection}
        isLoading={listQuery.isLoading || revokeMutation.isPending}
        onClose={() => {
          setHistoryAccount(null)
        }}
      />
    </Stack>
  )
}

type AgentServiceAccountRowActionsProps = {
  onEdit: () => void
  onIssueCredential: () => void
  onViewCredentials: () => void
}

function AgentServiceAccountRowActions({
  onEdit,
  onIssueCredential,
  onViewCredentials,
}: AgentServiceAccountRowActionsProps) {
  return (
    <Stack direction="row" gap={UI_STACK_GAP_MEDIUM}>
      <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={onEdit}>
        {UI_AGENT_SERVICE_ACCOUNT_ACTION_EDIT}
      </Button>
      <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={onIssueCredential}>
        {UI_AGENT_SERVICE_ACCOUNT_ACTION_ISSUE_CREDENTIAL}
      </Button>
      <Button variant={UI_BUTTON_VARIANT_SECONDARY} onClick={onViewCredentials}>
        {UI_AGENT_SERVICE_ACCOUNT_ACTION_VIEW_CREDENTIALS}
      </Button>
    </Stack>
  )
}

type EditServiceAccountModalProps = {
  show: boolean
  editingName: string
  editingDescription: string
  editingStatus: AccountStatus
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStatusChange: (value: AccountStatus) => void
  onClose: () => void
  onSave: () => void
  isPending: boolean
  canSubmit: boolean
}

function EditServiceAccountModal({
  show,
  editingName,
  editingDescription,
  editingStatus,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onClose,
  onSave,
  isPending,
  canSubmit,
}: EditServiceAccountModalProps) {
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_AGENT_SERVICE_ACCOUNT_MODAL_EDIT_TITLE}
      body={
        <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_NAME}</Form.Label>
            <Form.Control value={editingName} onChange={(event) => onNameChange(event.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_DESCRIPTION}</Form.Label>
            <Form.Control value={editingDescription} onChange={(event) => onDescriptionChange(event.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_STATUS}</Form.Label>
            <Form.Select
              value={editingStatus}
              onChange={(event) =>
                onStatusChange(
                  event.target.value === UI_AGENT_SERVICE_ACCOUNT_STATUS_DISABLED
                    ? UI_AGENT_SERVICE_ACCOUNT_STATUS_DISABLED
                    : UI_AGENT_SERVICE_ACCOUNT_STATUS_ACTIVE
                )
              }
            >
              <option value={UI_AGENT_SERVICE_ACCOUNT_STATUS_ACTIVE}>
                {UI_AGENT_SERVICE_ACCOUNT_STATUS_LABEL_ACTIVE}
              </option>
              <option value={UI_AGENT_SERVICE_ACCOUNT_STATUS_DISABLED}>
                {UI_AGENT_SERVICE_ACCOUNT_STATUS_LABEL_DISABLED}
              </option>
            </Form.Select>
          </Form.Group>
        </Stack>
      }
      secondaryAction={{
        id: 'agent-account-edit-cancel',
        label: UI_ACTION_CANCEL,
        onClick: onClose,
        variant: UI_BUTTON_VARIANT_SECONDARY,
        disabled: isPending,
      }}
      primaryAction={{
        id: 'agent-account-edit-save',
        label: UI_AGENT_SERVICE_ACCOUNT_SUBMIT_UPDATE,
        onClick: onSave,
        variant: UI_BUTTON_VARIANT_PRIMARY,
        disabled: !canSubmit,
      }}
    />
  )
}

type IssueCredentialModalProps = {
  show: boolean
  credentialName: string
  scopesInput: string
  expiresAt: string
  credentialResult: CredentialResult | null
  onCredentialNameChange: (value: string) => void
  onScopesInputChange: (value: string) => void
  onExpiresAtChange: (value: string) => void
  onClose: () => void
  onIssue: () => void
  issuePending: boolean
  issueButtonDisabled: boolean
}

function IssueCredentialModal({
  show,
  credentialName,
  scopesInput,
  expiresAt,
  credentialResult,
  onCredentialNameChange,
  onScopesInputChange,
  onExpiresAtChange,
  onClose,
  onIssue,
  issuePending,
  issueButtonDisabled,
}: IssueCredentialModalProps) {
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_AGENT_SERVICE_ACCOUNT_MODAL_ISSUE_CREDENTIAL_TITLE}
      body={
        <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_CREDENTIAL_NAME}</Form.Label>
            <Form.Control
              value={credentialName}
              onChange={(event) => onCredentialNameChange(event.target.value)}
              disabled={Boolean(credentialResult)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_SCOPES}</Form.Label>
            <Form.Control
              value={scopesInput}
              onChange={(event) => onScopesInputChange(event.target.value)}
              disabled={Boolean(credentialResult)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_EXPIRES_AT}</Form.Label>
            <Form.Control
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => onExpiresAtChange(event.target.value)}
              disabled={Boolean(credentialResult)}
            />
          </Form.Group>
          {credentialResult ? (
            <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
              <strong>{UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_TITLE}</strong>
              <Form.Group>
                <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_CLIENT_ID}</Form.Label>
                <Form.Control value={credentialResult.clientId} readOnly={true} />
              </Form.Group>
              <Form.Group>
                <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_CLIENT_SECRET}</Form.Label>
                <Form.Control value={credentialResult.clientSecret} readOnly={true} />
              </Form.Group>
            </Stack>
          ) : null}
        </Stack>
      }
      secondaryAction={{
        id: 'agent-credential-close',
        label: credentialResult ? UI_ACTION_CLOSE : UI_ACTION_CANCEL,
        onClick: onClose,
        variant: UI_BUTTON_VARIANT_SECONDARY,
        disabled: issuePending,
      }}
      primaryAction={
        credentialResult
          ? undefined
          : {
              id: 'agent-credential-issue',
              label: UI_AGENT_SERVICE_ACCOUNT_SUBMIT_ISSUE,
              onClick: onIssue,
              variant: UI_BUTTON_VARIANT_PRIMARY,
              disabled: issueButtonDisabled,
            }
      }
    />
  )
}

type CredentialHistoryModalProps = {
  show: boolean
  credentialStatusFilter: CredentialStatusFilter
  credentialSearchTerm: string
  credentialSortOrder: CredentialSortOrder
  onStatusFilterChange: (value: CredentialStatusFilter) => void
  onSearchTermChange: (value: string) => void
  onSortOrderChange: (value: CredentialSortOrder) => void
  batchBar: ReactNode
  credentials: readonly AgentServiceCredential[]
  columns: readonly UiDataTableColumn<AgentServiceCredential>[]
  selection?: UiDataTableSelection<AgentServiceCredential>
  isLoading: boolean
  onClose: () => void
}

function CredentialHistoryModal({
  show,
  credentialStatusFilter,
  credentialSearchTerm,
  credentialSortOrder,
  onStatusFilterChange,
  onSearchTermChange,
  onSortOrderChange,
  batchBar,
  credentials,
  columns,
  selection,
  isLoading,
  onClose,
}: CredentialHistoryModalProps) {
  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_AGENT_SERVICE_ACCOUNT_MODAL_CREDENTIAL_HISTORY_TITLE}
      body={
        <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_LABEL}</Form.Label>
            <Form.Select
              value={credentialStatusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as CredentialStatusFilter)}
            >
              <option value={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ALL}>
                {UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_ALL}
              </option>
              <option value={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_ACTIVE}>
                {UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_ACTIVE}
              </option>
              <option value={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_REVOKED}>
                {UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_REVOKED}
              </option>
              <option value={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_VALUE_EXPIRED}>
                {UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_FILTER_EXPIRED}
              </option>
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SEARCH_LABEL}</Form.Label>
            <Form.Control
              value={credentialSearchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SEARCH_PLACEHOLDER}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_LABEL}</Form.Label>
            <Form.Select
              value={credentialSortOrder}
              onChange={(event) => onSortOrderChange(event.target.value as CredentialSortOrder)}
            >
              <option value={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_NEWEST}>
                {UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_NEWEST}
              </option>
              <option value={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_VALUE_OLDEST}>
                {UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_SORT_OLDEST}
              </option>
            </Form.Select>
          </Form.Group>
          <TableControls batch={batchBar} />
          <DataTable
            data={credentials}
            columns={columns}
            rowKey={(row) => row.id}
            emptyState={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_EMPTY_STATE}
            isLoading={isLoading}
            selection={selection}
          />
        </Stack>
      }
      secondaryAction={{
        id: 'agent-credential-history-close',
        label: UI_ACTION_CLOSE,
        onClick: onClose,
        variant: UI_BUTTON_VARIANT_SECONDARY,
      }}
    />
  )
}

const isCredentialExpired = (credential: AgentServiceCredential): boolean => {
  if (!credential.expiresAt) {
    return false
  }
  const expiresAtTime = new Date(credential.expiresAt).getTime()
  if (Number.isNaN(expiresAtTime)) {
    return false
  }
  return expiresAtTime <= Date.now()
}
