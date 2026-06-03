import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { DEFAULT_NOTIFICATION_EVENT, NOTIFICATION_VARIANT_ERROR, NOTIFICATION_VARIANT_SUCCESS } from '@/app/constants'
import { useNotificationBus } from '@/notifications/useNotificationBus'
import type { Client } from '@/simpleLicense'
import { useChangeLicenseDomain } from '@/simpleLicense'
import {
  UI_ALERT_VARIANT_DANGER,
  UI_ALERT_VARIANT_SUCCESS,
  UI_BUTTON_VARIANT_PRIMARY,
  UI_CLASS_CODE_VALUE_WRAP,
  UI_CLASS_FORM_FIELD,
  UI_CLASS_INLINE_ALERT,
  UI_CLASS_MARGIN_BOTTOM_MUTED,
  UI_CLASS_MARGIN_TOP_MEDIUM,
  UI_LICENSE_CHANGE_DOMAIN_DESCRIPTION,
  UI_LICENSE_CHANGE_DOMAIN_FIELD_CURRENT,
  UI_LICENSE_CHANGE_DOMAIN_FIELD_NEW,
  UI_LICENSE_CHANGE_DOMAIN_PENDING,
  UI_LICENSE_CHANGE_DOMAIN_PLACEHOLDER_NEW,
  UI_LICENSE_CHANGE_DOMAIN_RESULT_NEW_DOMAIN,
  UI_LICENSE_CHANGE_DOMAIN_RESULT_NEW_KEY,
  UI_LICENSE_CHANGE_DOMAIN_SUBMIT,
  UI_LICENSE_CHANGE_DOMAIN_SUCCESS_BODY,
  UI_LICENSE_CHANGE_DOMAIN_SUCCESS_TITLE,
  UI_LICENSE_CHANGE_DOMAIN_TITLE,
  UI_LICENSE_CHANGE_DOMAIN_TOAST_ERROR,
  UI_LICENSE_CHANGE_DOMAIN_TOAST_SUCCESS,
  UI_LICENSE_CHANGE_DOMAIN_VALIDATION_SAME,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { KeyValueList } from '../typography/KeyValueList'

type ChangeDomainPanelProps = {
  client: Client
  licenseKey: string
  currentDomain?: string
  onChanged?: () => void
}

type ChangeDomainResult = {
  newKey: string
  newDomain: string
}

export function ChangeDomainPanel({ client, licenseKey, currentDomain, onChanged }: ChangeDomainPanelProps) {
  const notificationBus = useNotificationBus()
  const changeDomainMutation = useChangeLicenseDomain(client)
  const [newDomain, setNewDomain] = useState('')
  const [result, setResult] = useState<ChangeDomainResult | null>(null)

  const trimmedNewDomain = newDomain.trim()
  const normalizedCurrent = (currentDomain ?? '').trim().toLowerCase()
  const isSameDomain = trimmedNewDomain.length > 0 && trimmedNewDomain.toLowerCase() === normalizedCurrent
  const canSubmit = trimmedNewDomain.length > 0 && !isSameDomain && !changeDomainMutation.isPending

  const handleSubmit = async () => {
    if (!canSubmit) {
      return
    }
    try {
      const response = await changeDomainMutation.mutateAsync({
        current_license_key: licenseKey,
        new_domain: trimmedNewDomain,
      })
      setResult({ newKey: response.license.licenseKey, newDomain: trimmedNewDomain })
      setNewDomain('')
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_LICENSE_CHANGE_DOMAIN_TOAST_SUCCESS,
        variant: NOTIFICATION_VARIANT_SUCCESS,
      })
      onChanged?.()
    } catch {
      notificationBus.emit(DEFAULT_NOTIFICATION_EVENT, {
        titleKey: UI_LICENSE_CHANGE_DOMAIN_TOAST_ERROR,
        variant: NOTIFICATION_VARIANT_ERROR,
      })
    }
  }

  return (
    <div>
      <h5>{UI_LICENSE_CHANGE_DOMAIN_TITLE}</h5>
      <p className={UI_CLASS_MARGIN_BOTTOM_MUTED}>{UI_LICENSE_CHANGE_DOMAIN_DESCRIPTION}</p>

      <Form.Group className={UI_CLASS_FORM_FIELD}>
        <Form.Label>{UI_LICENSE_CHANGE_DOMAIN_FIELD_CURRENT}</Form.Label>
        <Form.Control value={currentDomain || UI_VALUE_PLACEHOLDER} readOnly={true} disabled={true} />
      </Form.Group>

      <Form.Group className={UI_CLASS_FORM_FIELD}>
        <Form.Label>{UI_LICENSE_CHANGE_DOMAIN_FIELD_NEW}</Form.Label>
        <Form.Control
          value={newDomain}
          placeholder={UI_LICENSE_CHANGE_DOMAIN_PLACEHOLDER_NEW}
          onChange={(event) => setNewDomain(event.target.value)}
          isInvalid={isSameDomain}
        />
        {isSameDomain ? (
          <Form.Control.Feedback type="invalid">{UI_LICENSE_CHANGE_DOMAIN_VALIDATION_SAME}</Form.Control.Feedback>
        ) : null}
      </Form.Group>

      {changeDomainMutation.isError ? (
        <Alert variant={UI_ALERT_VARIANT_DANGER} className={UI_CLASS_INLINE_ALERT}>
          {changeDomainMutation.error instanceof Error
            ? changeDomainMutation.error.message
            : UI_LICENSE_CHANGE_DOMAIN_TOAST_ERROR}
        </Alert>
      ) : null}

      <Button
        variant={UI_BUTTON_VARIANT_PRIMARY}
        onClick={() => {
          void handleSubmit()
        }}
        disabled={!canSubmit}
      >
        {changeDomainMutation.isPending ? UI_LICENSE_CHANGE_DOMAIN_PENDING : UI_LICENSE_CHANGE_DOMAIN_SUBMIT}
      </Button>

      {result ? (
        <Alert variant={UI_ALERT_VARIANT_SUCCESS} className={UI_CLASS_MARGIN_TOP_MEDIUM}>
          <Alert.Heading>{UI_LICENSE_CHANGE_DOMAIN_SUCCESS_TITLE}</Alert.Heading>
          <p>{UI_LICENSE_CHANGE_DOMAIN_SUCCESS_BODY}</p>
          <KeyValueList
            items={[
              {
                id: UI_LICENSE_CHANGE_DOMAIN_RESULT_NEW_KEY,
                label: UI_LICENSE_CHANGE_DOMAIN_RESULT_NEW_KEY,
                value: <code className={UI_CLASS_CODE_VALUE_WRAP}>{result.newKey || UI_VALUE_PLACEHOLDER}</code>,
              },
              {
                id: UI_LICENSE_CHANGE_DOMAIN_RESULT_NEW_DOMAIN,
                label: UI_LICENSE_CHANGE_DOMAIN_RESULT_NEW_DOMAIN,
                value: <code className={UI_CLASS_CODE_VALUE_WRAP}>{result.newDomain || UI_VALUE_PLACEHOLDER}</code>,
              },
            ]}
          />
        </Alert>
      ) : null}
    </div>
  )
}
