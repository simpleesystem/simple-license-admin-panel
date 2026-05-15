import { useCallback, useEffect, useState } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import type { Client, UpdateLicenseRequest, User } from '@/simpleLicense'
import { useUpdateLicense } from '@/simpleLicense'
import { useLogger } from '../../app/logging/loggerContext'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_ANALYTICS_COLUMN_LICENSE_KEY,
  UI_CLASS_MARGIN_BOTTOM_LARGE,
  UI_CLASS_MARGIN_BOTTOM_MUTED,
  UI_CLASS_PADDING_TOP_SMALL,
  UI_LICENSE_ACTIVATIONS_COLUMN_DOMAIN,
  UI_LICENSE_FORM_PENDING_UPDATE,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
  UI_LICENSE_FORM_TITLE_UPDATE,
  UI_LICENSE_STATUS_ACTION_RETRY,
  UI_LICENSE_STATUS_ERROR_BODY,
  UI_LICENSE_STATUS_ERROR_TITLE,
  UI_LICENSE_STATUS_LOADING_BODY,
  UI_LICENSE_STATUS_LOADING_TITLE,
  UI_MODAL_SIZE_XL,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import { AsyncStatusGate } from '../feedback/AsyncStatusGate'
import type { FormBlueprint } from '../formBuilder/blueprint'
import { DynamicForm } from '../formBuilder/DynamicForm'
import { createLicenseBlueprint } from '../formBuilder/factories'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiSelectOption } from '../types'
import { KeyValueList } from '../typography/KeyValueList'
import { LicenseActivationsPanel } from './LicenseActivationsPanel'
import { LicenseUsageDetailsPanel } from './LicenseUsageDetailsPanel'
import { useDialogFormMutation } from './useDialogFormMutation'

type LicenseUpdateDialogProps = {
  client: Client
  licenseKey: string
  // License key is needed for usage details, but list item only has ID.
  // We can fetch details or assume key is not available initially and fetch it.
  // Ideally, list item should have key, but we can fetch license details here.
  initialValues?: Partial<UpdateLicenseRequest>
  tierOptions: readonly UiSelectOption[]
  currentUser?: User | null
  show: boolean
  onClose: () => void
  onCompleted?: () => void
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

type FormValuesUpdate = Omit<UpdateLicenseRequest, 'metadata'> & { metadata: string }

export function LicenseUpdateDialog({
  client,
  licenseKey: licenseKeyParam,
  initialValues,
  tierOptions,
  currentUser,
  show,
  onClose,
  onCompleted,
  onSuccess,
  onError,
}: LicenseUpdateDialogProps) {
  const logger = useLogger()
  const [activeTab, setActiveTab] = useState('details')
  const [metadataString, setMetadataString] = useState<string>('')
  const [licenseKey, setLicenseKey] = useState<string>(licenseKeyParam)
  const [domain, setDomain] = useState<string>('')
  const [isLicenseLoading, setIsLicenseLoading] = useState(false)
  const [isLicenseError, setIsLicenseError] = useState(false)

  const fetchLicenseDetails = useCallback(async () => {
    setIsLicenseLoading(true)
    setIsLicenseError(false)
    setLicenseKey(licenseKeyParam)
    setDomain('')
    setMetadataString('')
    try {
      const response = await client.getLicense(licenseKeyParam)
      const license = response.license
      if (license.metadata) {
        setMetadataString(JSON.stringify(license.metadata, null, 2))
      }
      if (license.licenseKey) {
        setLicenseKey(license.licenseKey)
      }
      if (license.domain != null && license.domain !== '') {
        setDomain(String(license.domain))
      }
    } catch (e) {
      logger.error(e instanceof Error ? e : new Error(String(e)), { message: 'Failed to fetch license details' })
      setIsLicenseError(true)
    } finally {
      setIsLicenseLoading(false)
    }
  }, [client, licenseKeyParam, logger])

  useEffect(() => {
    if (show) {
      void fetchLicenseDetails()
    }
  }, [show, fetchLicenseDetails])

  const updateMutation = useUpdateLicense(client)

  const adapter: MutationAdapter<FormValuesUpdate> = {
    mutateAsync: async (values) => {
      const { domain: _domain, ...rest } = values
      const data: UpdateLicenseRequest = {
        ...rest,
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      return await updateMutation.mutateAsync({
        id: licenseKeyParam,
        data,
      })
    },
    isPending: updateMutation.isPending,
  }

  const { handleSubmit } = useDialogFormMutation({
    mutation: adapter,
    onCompleted,
    onSuccess,
    onError,
    onClose,
  })

  const blueprint = createLicenseBlueprint('update', {
    tierOptions,
  }) as unknown as FormBlueprint<FormValuesUpdate>

  const defaultValues: FormValuesUpdate = {
    customer_email: initialValues?.customer_email,
    tier_code: initialValues?.tier_code,
    activation_limit: initialValues?.activation_limit,
    expires_days: initialValues?.expires_days,
    metadata: metadataString || (initialValues?.metadata ? JSON.stringify(initialValues.metadata, null, 2) : ''),
  }

  return (
    <ModalDialog
      show={show}
      onClose={onClose}
      title={UI_LICENSE_FORM_TITLE_UPDATE}
      size={UI_MODAL_SIZE_XL}
      body={
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'details')}
          className={UI_CLASS_MARGIN_BOTTOM_LARGE}
        >
          <Tab eventKey="details" title="Details">
            <AsyncStatusGate
              isLoading={isLicenseLoading}
              isError={isLicenseError}
              loadingTitle={UI_LICENSE_STATUS_LOADING_TITLE}
              loadingMessage={UI_LICENSE_STATUS_LOADING_BODY}
              errorTitle={UI_LICENSE_STATUS_ERROR_TITLE}
              errorMessage={UI_LICENSE_STATUS_ERROR_BODY}
              retryLabel={UI_LICENSE_STATUS_ACTION_RETRY}
              onRetry={() => {
                if (show) {
                  void fetchLicenseDetails()
                }
              }}
            >
              <div className={UI_CLASS_MARGIN_BOTTOM_MUTED}>
                <KeyValueList
                  items={[
                    {
                      id: UI_ANALYTICS_COLUMN_LICENSE_KEY,
                      label: UI_ANALYTICS_COLUMN_LICENSE_KEY,
                      value: <code>{licenseKey || UI_VALUE_PLACEHOLDER}</code>,
                    },
                    {
                      id: UI_LICENSE_ACTIVATIONS_COLUMN_DOMAIN,
                      label: UI_LICENSE_ACTIVATIONS_COLUMN_DOMAIN,
                      value: <code>{domain || UI_VALUE_PLACEHOLDER}</code>,
                    },
                  ]}
                />
              </div>
              <DynamicForm
                blueprint={blueprint}
                defaultValues={defaultValues}
                onSubmit={handleSubmit}
                submitLabel={UI_LICENSE_FORM_SUBMIT_UPDATE}
                pendingLabel={UI_LICENSE_FORM_PENDING_UPDATE}
                cancelLabel="Cancel"
                onCancel={onClose}
              />
            </AsyncStatusGate>
          </Tab>
          <Tab eventKey="activations" title="Activations">
            <div className={UI_CLASS_PADDING_TOP_SMALL}>
              <LicenseActivationsPanel
                client={client}
                licenseKey={licenseKeyParam}
                currentUser={currentUser}
                // Activations panel handles fetching internally
              />
            </div>
          </Tab>
          <Tab eventKey="usage" title="Usage">
            <div className={UI_CLASS_PADDING_TOP_SMALL}>
              <AsyncStatusGate
                isLoading={isLicenseLoading || !licenseKey}
                isError={isLicenseError}
                loadingTitle={UI_LICENSE_STATUS_LOADING_TITLE}
                loadingMessage={UI_LICENSE_STATUS_LOADING_BODY}
                errorTitle={UI_LICENSE_STATUS_ERROR_TITLE}
                errorMessage={UI_LICENSE_STATUS_ERROR_BODY}
                retryLabel={UI_LICENSE_STATUS_ACTION_RETRY}
                onRetry={() => {
                  if (show) {
                    void fetchLicenseDetails()
                  }
                }}
              >
                <LicenseUsageDetailsPanel
                  client={client}
                  licenseKey={licenseKey}
                  currentUser={currentUser}
                  // Usage panel handles fetching internally
                />
              </AsyncStatusGate>
            </div>
          </Tab>
        </Tabs>
      }
      footer={null}
    />
  )
}
