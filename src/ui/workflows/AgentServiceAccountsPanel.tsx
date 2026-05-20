import { useCallback, useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { DEFAULT_NOTIFICATION_EVENT, NOTIFICATION_VARIANT_ERROR, NOTIFICATION_VARIANT_SUCCESS } from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import type { AgentServiceAccount, AgentServiceCredential, Client } from '@/simpleLicense'
import {
  useAdminAgentServiceAccounts,
  useIssueAgentServiceCredential,
  useRevokeAgentServiceCredential,
} from '@/simpleLicense'
import {
  UI_ACTION_CANCEL,
  UI_ACTION_CLOSE,
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
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_CLIENT_ID,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_CLIENT_SECRET,
  UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_RESULT_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_EMPTY_STATE,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_CREDENTIAL_NAME,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_EXPIRES_AT,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_SCOPES,
  UI_AGENT_SERVICE_ACCOUNT_MODAL_CREDENTIAL_HISTORY_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_MODAL_ISSUE_CREDENTIAL_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_PANEL_DESCRIPTION,
  UI_AGENT_SERVICE_ACCOUNT_PANEL_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM,
  UI_AGENT_SERVICE_ACCOUNT_SUBMIT_ISSUE,
  UI_AGENT_SERVICE_ACCOUNT_SUBMIT_REVOKE,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_ISSUE_ERROR,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_ISSUE_SUCCESS,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_ERROR,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_STACK_GAP_MEDIUM,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { DataTable } from '../data/DataTable'
import { PanelHeader } from '../layout/PanelHeader'
import { Stack } from '../layout/Stack'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiDataTableColumn } from '../types'
import { formatDateSafe } from '../utils/formatUtils'

type AgentServiceAccountsPanelProps = {
  client: Client
  currentUserVendorId?: string | null
  tenantNameById: Record<string, string>
}

type CredentialResult = {
  clientId: string
  clientSecret: string
}

export function AgentServiceAccountsPanel({
  client,
  currentUserVendorId,
  tenantNameById,
}: AgentServiceAccountsPanelProps) {
  const [selectedAccount, setSelectedAccount] = useState<AgentServiceAccount | null>(null)
  const [historyAccount, setHistoryAccount] = useState<AgentServiceAccount | null>(null)
  const [credentialName, setCredentialName] = useState('')
  const [scopesInput, setScopesInput] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [credentialResult, setCredentialResult] = useState<CredentialResult | null>(null)
  const notificationBus = useNotificationBus()
  const listQuery = useAdminAgentServiceAccounts(client, currentUserVendorId ?? null)
  const issueMutation = useIssueAgentServiceCredential(client)
  const revokeMutation = useRevokeAgentServiceCredential(client)

  const rows = useMemo<AgentServiceAccount[]>(() => listQuery.data ?? [], [listQuery.data])
  const issueButtonDisabled = issueMutation.isPending || credentialName.trim().length === 0

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
          <Stack direction="row" gap={UI_STACK_GAP_MEDIUM}>
            <Button
              variant={UI_BUTTON_VARIANT_SECONDARY}
              onClick={() => {
                setSelectedAccount(row)
                setCredentialName('')
                setScopesInput('')
                setExpiresAt('')
                setCredentialResult(null)
              }}
            >
              {UI_AGENT_SERVICE_ACCOUNT_ACTION_ISSUE_CREDENTIAL}
            </Button>
            <Button
              variant={UI_BUTTON_VARIANT_SECONDARY}
              onClick={() => {
                setHistoryAccount(row)
              }}
            >
              {UI_AGENT_SERVICE_ACCOUNT_ACTION_VIEW_CREDENTIALS}
            </Button>
          </Stack>
        ),
      },
    ],
    [tenantNameById]
  )

  const credentialsForHistory = useMemo<AgentServiceCredential[]>(
    () => historyAccount?.credentials ?? [],
    [historyAccount?.credentials]
  )

  const handleRevokeCredential = useCallback(
    async (credentialId: string) => {
      try {
        await revokeMutation.mutateAsync(credentialId)
        notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
          titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_SUCCESS,
          variant: NOTIFICATION_VARIANT_SUCCESS,
        })
        const refreshed = (listQuery.data ?? []).find((account) => account.id === historyAccount?.id) ?? null
        setHistoryAccount(refreshed)
      } catch {
        notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
          titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_REVOKE_ERROR,
          variant: NOTIFICATION_VARIANT_ERROR,
        })
      }
    },
    [historyAccount?.id, listQuery.data, notificationBus, revokeMutation]
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
      },
      {
        id: 'agent-credential-scopes',
        header: UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_COLUMN_SCOPES,
        cell: (row) => row.scopes.join(', '),
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
      <ModalDialog
        show={Boolean(selectedAccount)}
        onClose={() => {
          setSelectedAccount(null)
          setCredentialResult(null)
        }}
        title={UI_AGENT_SERVICE_ACCOUNT_MODAL_ISSUE_CREDENTIAL_TITLE}
        body={
          <Stack direction="column" gap={UI_STACK_GAP_MEDIUM}>
            <Form.Group>
              <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_CREDENTIAL_NAME}</Form.Label>
              <Form.Control
                value={credentialName}
                onChange={(event) => setCredentialName(event.target.value)}
                disabled={Boolean(credentialResult)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_SCOPES}</Form.Label>
              <Form.Control
                value={scopesInput}
                onChange={(event) => setScopesInput(event.target.value)}
                disabled={Boolean(credentialResult)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_EXPIRES_AT}</Form.Label>
              <Form.Control
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
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
          onClick: () => {
            setSelectedAccount(null)
            setCredentialResult(null)
          },
          variant: UI_BUTTON_VARIANT_SECONDARY,
          disabled: issueMutation.isPending,
        }}
        primaryAction={
          credentialResult
            ? undefined
            : {
                id: 'agent-credential-issue',
                label: UI_AGENT_SERVICE_ACCOUNT_SUBMIT_ISSUE,
                onClick: () => {
                  void handleIssueCredential()
                },
                variant: UI_BUTTON_VARIANT_PRIMARY,
                disabled: issueButtonDisabled,
              }
        }
      />
      <ModalDialog
        show={Boolean(historyAccount)}
        onClose={() => {
          setHistoryAccount(null)
        }}
        title={UI_AGENT_SERVICE_ACCOUNT_MODAL_CREDENTIAL_HISTORY_TITLE}
        body={
          <DataTable
            data={credentialsForHistory}
            columns={credentialHistoryColumns}
            rowKey={(row) => row.id}
            emptyState={UI_AGENT_SERVICE_ACCOUNT_CREDENTIAL_EMPTY_STATE}
            isLoading={listQuery.isLoading || revokeMutation.isPending}
          />
        }
        secondaryAction={{
          id: 'agent-credential-history-close',
          label: UI_ACTION_CLOSE,
          onClick: () => {
            setHistoryAccount(null)
          },
          variant: UI_BUTTON_VARIANT_SECONDARY,
        }}
      />
    </Stack>
  )
}
