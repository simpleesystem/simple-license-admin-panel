import type { Client, FreezeLicenseRequest, User } from '@/simpleLicense'
import { useFreezeLicense } from '@/simpleLicense'
import { canUpdateLicense } from '../../app/auth/permissions'
import type { MutationAdapter } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import { UI_LICENSE_FREEZE_FORM_PENDING_LABEL, UI_LICENSE_FREEZE_FORM_SUBMIT_LABEL } from '../constants'
import { createLicenseFreezeBlueprint } from '../formBuilder/factories'
import { FormModalWithMutation } from '../formBuilder/mutationBridge'

type LicenseFreezeFormFlowProps = {
  client: Client
  licenseKey: string
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
  licenseKey,
  currentUser,
  onSuccess,
  ...modalProps
}: LicenseFreezeFormFlowProps) {
  const mutation = adaptMutation(useFreezeLicense(client))
  const allowFreeze = canUpdateLicense((currentUser as User | null) ?? null)

  if (!allowFreeze) {
    return null
  }

  const mutationAdapter: MutationAdapter<FreezeLicenseRequest> = {
    mutateAsync: async (values) => {
      const result = await mutation.mutateAsync({ id: licenseKey, data: values })
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
