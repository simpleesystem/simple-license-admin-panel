import { useEffect, useState } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import type { Client, UpdateLicenseRequest, User } from '@/simpleLicense'
import { useUpdateLicense } from '@/simpleLicense'
import { useLogger } from '../../app/logging/loggerContext'

import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_ANALYTICS_COLUMN_LICENSE_KEY,
  UI_LICENSE_FORM_PENDING_UPDATE,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
  UI_LICENSE_FORM_TITLE_UPDATE,
  UI_MODAL_SIZE_XL,
  UI_VALUE_PLACEHOLDER,
} from '../constants'
import type { FormBlueprint } from '../formBuilder/blueprint'
import { DynamicForm } from '../formBuilder/DynamicForm'
import { createLicenseBlueprint } from '../formBuilder/factories'
import { useFormMutation } from '../formBuilder/useFormMutation'
import { ModalDialog } from '../overlay/ModalDialog'
import type { UiSelectOption } from '../types'
import { LicenseActivationsPanel } from './LicenseActivationsPanel'
import { LicenseUsageDetailsPanel } from './LicenseUsageDetailsPanel'
import { wrapMutationAdapter } from './mutationHelpers'

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

  useEffect(() => {
    const fetchLicenseDetails = async () => {
      try {
        const response = await client.getLicense(licenseKeyParam)
        const license = response.license
        if (license.metadata) {
          setMetadataString(JSON.stringify(license.metadata, null, 2))
        }
        if (license.licenseKey) {
          setLicenseKey(license.licenseKey)
        }
      } catch (e) {
        logger.error(e instanceof Error ? e : new Error(String(e)), { message: 'Failed to fetch license details' })
      }
    }

    if (show) {
      void fetchLicenseDetails()
    }
  }, [client, licenseKeyParam, show, logger])

  const updateMutation = useUpdateLicense(client)

  const adapter: MutationAdapter<FormValuesUpdate> = {
    mutateAsync: async (values) => {
      const data: UpdateLicenseRequest = {
        ...values,
        metadata: values.metadata ? JSON.parse(values.metadata) : undefined,
      }
      return await updateMutation.mutateAsync({
        id: licenseKeyParam,
        data,
      })
    },
    isPending: updateMutation.isPending,
  }

  const wrappedMutation = wrapMutationAdapter(adapter, {
    onClose,
    onCompleted,
    onSuccess,
    onError,
  })

  const { handleSubmit } = useFormMutation({
    mutation: wrappedMutation,
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
    onError,
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
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'details')} className="mb-4">
          <Tab eventKey="details" title="Details">
            <div className="mb-3 text-muted">
              <strong>{UI_ANALYTICS_COLUMN_LICENSE_KEY}:</strong> <code>{licenseKey || UI_VALUE_PLACEHOLDER}</code>
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
          </Tab>
          <Tab eventKey="activations" title="Activations">
            <div className="pt-2">
              <LicenseActivationsPanel
                client={client}
                licenseKey={licenseKeyParam}
                currentUser={currentUser}
                // Activations panel handles fetching internally
              />
            </div>
          </Tab>
          <Tab eventKey="usage" title="Usage">
            <div className="pt-2">
              {licenseKey ? (
                <LicenseUsageDetailsPanel
                  client={client}
                  licenseKey={licenseKey}
                  currentUser={currentUser}
                  // Usage panel handles fetching internally
                />
              ) : (
                <div className="text-center p-4 text-muted">Loading license details...</div>
              )}
            </div>
          </Tab>
        </Tabs>
      }
      footer={null}
    />
  )
}
