import type { Client, LicenseStatus, User } from '@simple-license/react-sdk'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'

import {
  UI_LICENSE_BUTTON_CREATE,
  UI_LICENSE_BUTTON_EDIT,
  UI_LICENSE_FORM_SUBMIT_CREATE,
  UI_LICENSE_FORM_SUBMIT_UPDATE,
} from '../constants'
import {
  canCreateLicense,
  canUpdateLicense,
  canViewLicenses,
  isLicenseOwnedByUser,
  isVendorScopedUser,
} from '../app/auth/permissions'
import type { UiSelectOption } from '../types'
import { Stack } from '../layout/Stack'
import { LicenseFormFlow } from './LicenseFormFlow'
import { LicenseRowActions } from './LicenseRowActions'

type LicenseManagementExampleProps = {
  client: Client
  licenseId: string
  licenseVendorId?: string | null
  licenseStatus: LicenseStatus
  tierOptions: readonly UiSelectOption[]
  productOptions: readonly UiSelectOption[]
  currentUser?: Pick<User, 'role' | 'vendorId'> | null
  onRefresh?: () => void
}

export function LicenseManagementExample({
  client,
  licenseId,
  licenseVendorId,
  licenseStatus,
  tierOptions,
  productOptions,
  currentUser,
  onRefresh,
}: LicenseManagementExampleProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  const canView = canViewLicenses(currentUser ?? null)
  const allowUpdate = canUpdateLicense(currentUser ?? null, { vendorId: licenseVendorId })
  const allowCreate = canCreateLicense(currentUser ?? null)
  const isVendorScoped = isVendorScopedUser(currentUser)
  const isOwned = isLicenseOwnedByUser(currentUser ?? null, { vendorId: licenseVendorId })

  if (!canView || (isVendorScoped && !isOwned)) {
    return null
  }

  return (
    <Stack direction="column" gap="medium">
      {allowUpdate ? (
        <Stack direction="row" gap="small">
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            {UI_LICENSE_BUTTON_EDIT}
          </Button>
          <LicenseRowActions
            client={client}
            licenseId={licenseId}
            licenseVendorId={licenseVendorId}
            licenseStatus={licenseStatus}
            currentUser={currentUser}
            onCompleted={onRefresh}
          />
        </Stack>
      ) : null}
      {allowUpdate ? (
        <LicenseFormFlow
          client={client}
          mode="update"
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          submitLabel={UI_LICENSE_FORM_SUBMIT_UPDATE}
          licenseId={licenseId}
          licenseVendorId={licenseVendorId}
          tierOptions={tierOptions}
          defaultValues={{ tier_code: tierOptions[0]?.value }}
          onCompleted={onRefresh}
        />
      ) : null}
      {allowCreate ? (
        <LicenseFormFlow
          client={client}
          mode="create"
          show={false}
          onClose={() => {}}
          submitLabel={UI_LICENSE_FORM_SUBMIT_CREATE}
          tierOptions={tierOptions}
          productOptions={productOptions}
          defaultValues={{
            product_slug: productOptions[0]?.value ?? '',
            tier_code: tierOptions[0]?.value ?? '',
          }}
          onCompleted={onRefresh}
        />
      ) : null}
    </Stack>
  )
}


