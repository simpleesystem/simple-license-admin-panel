import type { Client, FreezeLicenseRequest, User } from '@simple-license/react-sdk'
import { useFreezeLicense } from '@simple-license/react-sdk'

import { adaptMutation } from '../actions/mutationAdapter'
import type { MutationAdapter } from '../actions/mutationActions'
import {
  UI_LICENSE_FREEZE_FORM_PENDING_LABEL,
  UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL,
} from '../constants'
import { canUpdateLicense } from '../../app/auth/permissions'
import { createLicenseFreezeBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'

type LicenseFreezeFormFlowProps = {
  client: Client
  licenseId: string
  licenseVendorId?: string | null
  currentUser?: Pick<User, 'role' | 'vendorId'> | null
  show: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEFAULT_FREEZE_VALUES: FreezeLicenseRequest = {
  freeze_entitlements: true,
  freeze_tier: true,
}

export function LicenseFreezeFormFlow({
  client,
  licenseId,
  licenseVendorId,
  currentUser,
  onSuccess,
  ...modalProps
}: LicenseFreezeFormFlowProps) {
  const mutation = adaptMutation(useFreezeLicense(client))
  const allowFreeze = canUpdateLicense(currentUser ?? null, { vendorId: licenseVendorId })

  if (!allowFreeze) {
    return null
  }

  const mutationAdapter: MutationAdapter<FreezeLicenseRequest> = {
    mutateAsync: async (values) => {
      const result = await mutation.mutateAsync({ id: licenseId, data: values })
      onSuccess?.()
      return result
    },
    isPending: mutation.isPending,
  }

  return (
    <FormModalWithMutation
      blueprint={createLicenseFreezeBlueprint()}
      defaultValues={DEFAULT_FREEZE_VALUES}
      mutation={mutationAdapter}
      submitLabel={UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL}
      pendingLabel={UI_LICENSE_FREEZE_FORM_PENDING_LABEL}
      {...modalProps}
    />
  )
}

