import { useEffect, useMemo, useState } from 'react'
import Form from 'react-bootstrap/Form'
import { DEFAULT_NOTIFICATION_EVENT, NOTIFICATION_VARIANT_ERROR, NOTIFICATION_VARIANT_SUCCESS } from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import type { Client } from '@/simpleLicense'
import { useCreateAgentServiceAccount } from '@/simpleLicense'
import {
  UI_ACTION_CANCEL,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_DESCRIPTION,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_NAME,
  UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_SCOPE_MODE,
  UI_AGENT_SERVICE_ACCOUNT_MODAL_TITLE,
  UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_LABEL_SYSTEM,
  UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_LABEL_VENDOR,
  UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM,
  UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_VENDOR,
  UI_AGENT_SERVICE_ACCOUNT_SUBMIT_CREATE,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_CREATE_ERROR,
  UI_AGENT_SERVICE_ACCOUNT_TOAST_CREATE_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_BUTTON_VARIANT_SECONDARY,
  UI_USER_FIELD_LABEL_VENDOR,
  UI_USER_VENDOR_PLACEHOLDER,
} from '../constants'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiSelectOption } from '../types'

type AgentServiceAccountCreateModalProps = {
  client: Client
  show: boolean
  onClose: () => void
  vendorOptions: readonly UiSelectOption[]
  currentUserRole?: string
  currentUserVendorId?: string | null
  onCompleted?: () => void
}

const SYSTEM_ROLES = ['SUPERUSER', 'ADMIN'] as const

export function AgentServiceAccountCreateModal({
  client,
  show,
  onClose,
  vendorOptions,
  currentUserRole,
  currentUserVendorId,
  onCompleted,
}: AgentServiceAccountCreateModalProps) {
  const notificationBus = useNotificationBus()
  const createMutation = useCreateAgentServiceAccount(client)
  const canCreateSystemScope = useMemo(
    () => SYSTEM_ROLES.includes((currentUserRole ?? '') as (typeof SYSTEM_ROLES)[number]),
    [currentUserRole]
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [scopeMode, setScopeMode] = useState<'SYSTEM' | 'VENDOR'>(
    canCreateSystemScope ? UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM : UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_VENDOR
  )
  const [vendorId, setVendorId] = useState(currentUserVendorId ?? '')

  useEffect(() => {
    if (!show) {
      return
    }
    setName('')
    setDescription('')
    setScopeMode(
      canCreateSystemScope ? UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM : UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_VENDOR
    )
    setVendorId(currentUserVendorId ?? '')
  }, [show, canCreateSystemScope, currentUserVendorId])

  const requiresVendor = scopeMode === UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_VENDOR
  const effectiveVendorId = currentUserVendorId ?? vendorId
  const canSubmit =
    name.trim().length > 0 &&
    (!requiresVendor || (typeof effectiveVendorId === 'string' && effectiveVendorId.trim().length > 0)) &&
    !createMutation.isPending

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        ...(description.trim().length > 0 ? { description: description.trim() } : {}),
        scopeMode,
        ...(requiresVendor && effectiveVendorId ? { vendorId: effectiveVendorId } : {}),
      })
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_CREATE_SUCCESS,
        variant: NOTIFICATION_VARIANT_SUCCESS,
      })
      onCompleted?.()
      onClose()
    } catch (_error) {
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_AGENT_SERVICE_ACCOUNT_TOAST_CREATE_ERROR,
        variant: NOTIFICATION_VARIANT_ERROR,
      })
    }
  }

  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_AGENT_SERVICE_ACCOUNT_MODAL_TITLE}
      body={
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_NAME}</Form.Label>
            <Form.Control value={name} onChange={(event) => setName(event.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_DESCRIPTION}</Form.Label>
            <Form.Control value={description} onChange={(event) => setDescription(event.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{UI_AGENT_SERVICE_ACCOUNT_FIELD_LABEL_SCOPE_MODE}</Form.Label>
            <Form.Select
              value={scopeMode}
              onChange={(event) => setScopeMode(event.target.value as 'SYSTEM' | 'VENDOR')}
              disabled={!canCreateSystemScope}
            >
              {canCreateSystemScope ? (
                <option value={UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_SYSTEM}>
                  {UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_LABEL_SYSTEM}
                </option>
              ) : null}
              <option value={UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_VENDOR}>
                {UI_AGENT_SERVICE_ACCOUNT_SCOPE_MODE_LABEL_VENDOR}
              </option>
            </Form.Select>
          </Form.Group>
          {requiresVendor ? (
            <Form.Group>
              <Form.Label>{UI_USER_FIELD_LABEL_VENDOR}</Form.Label>
              <Form.Select
                value={effectiveVendorId}
                onChange={(event) => setVendorId(event.target.value)}
                disabled={Boolean(currentUserVendorId)}
              >
                <option value="">{UI_USER_VENDOR_PLACEHOLDER}</option>
                {vendorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : null}
        </Form>
      }
      secondaryAction={{
        id: 'agent-service-account-cancel',
        label: UI_ACTION_CANCEL,
        onClick: onClose,
        variant: UI_BUTTON_VARIANT_SECONDARY,
        disabled: createMutation.isPending,
      }}
      primaryAction={{
        id: 'agent-service-account-create',
        label: UI_AGENT_SERVICE_ACCOUNT_SUBMIT_CREATE,
        onClick: () => {
          void handleSubmit()
        },
        variant: UI_BUTTON_VARIANT_PRIMARY,
        disabled: !canSubmit,
      }}
    />
  )
}
