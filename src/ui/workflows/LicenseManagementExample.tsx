import type { Client, LicenseStatus } from '@simple-license/react-sdk'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'

import type { UiSelectOption } from '../types'
import { Stack } from '../layout/Stack'
import { LicenseFormFlow } from './LicenseFormFlow'
import { LicenseRowActions } from './LicenseRowActions'

type LicenseManagementExampleProps = {
  client: Client
  licenseId: string
  licenseStatus: LicenseStatus
  tierOptions: readonly UiSelectOption[]
  productOptions: readonly UiSelectOption[]
}

export function LicenseManagementExample({
  client,
  licenseId,
  licenseStatus,
  tierOptions,
  productOptions,
}: LicenseManagementExampleProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <Stack direction="column" gap="medium">
      <Stack direction="row" gap="small">
        <Button variant="primary" onClick={() => setShowEditModal(true)}>
          Edit license
        </Button>
        <LicenseRowActions client={client} licenseId={licenseId} licenseStatus={licenseStatus} />
      </Stack>
      <LicenseFormFlow
        client={client}
        mode="update"
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        submitLabel="Save changes"
        licenseId={licenseId}
        tierOptions={tierOptions}
        defaultValues={{ tier_code: tierOptions[0]?.value }}
      />
      <LicenseFormFlow
        client={client}
        mode="create"
        show={false}
        onClose={() => {}}
        submitLabel="Create license"
        tierOptions={tierOptions}
        productOptions={productOptions}
        defaultValues={{
          product_slug: productOptions[0]?.value ?? '',
          tier_code: tierOptions[0]?.value ?? '',
        }}
      />
    </Stack>
  )
}


