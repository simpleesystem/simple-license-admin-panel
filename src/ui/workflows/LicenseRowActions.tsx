import type { Client, LicenseStatus, User } from '@simple-license/react-sdk'
import {
  useResumeLicense,
  useRevokeLicense,
  useSuspendLicense,
} from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import {
  UI_LICENSE_ACTION_DELETE,
  UI_LICENSE_ACTION_RESUME,
  UI_LICENSE_ACTION_SUSPEND,
} from '../constants'
import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'
import { canDeleteLicense, canUpdateLicense } from '../../app/auth/permissions'

type LicenseRowActionsProps = UiCommonProps & {
  client: Client
  licenseId: string
  licenseStatus: LicenseStatus
  licenseVendorId?: string | null
  currentUser?: Pick<User, 'role' | 'vendorId'> | null
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function LicenseRowActions({
  client,
  licenseId,
  licenseStatus,
  licenseVendorId,
  currentUser,
  onCompleted,
  buttonLabel,
  ...rest
}: LicenseRowActionsProps) {
  const revokeMutation = adaptMutation(useRevokeLicense(client))
  const suspendMutation = adaptMutation(useSuspendLicense(client))
  const resumeMutation = adaptMutation(useResumeLicense(client))
  const allowDelete = canDeleteLicense(currentUser ?? null)
  const allowUpdate = canUpdateLicense(currentUser ?? null, { vendorId: licenseVendorId })

  if (!allowDelete && !allowUpdate) {
    return null
  }

  const actions = createCrudActions<string>('License', {
    ...(allowDelete && {
      delete: {
        label: UI_LICENSE_ACTION_DELETE,
        mutation: {
          mutateAsync: async (payload) => {
            const result = await revokeMutation.mutateAsync(payload)
            onCompleted?.()
            return result
          },
          isPending: revokeMutation.isPending,
        },
        buildPayload: () => licenseId,
      },
    }),
    ...(allowUpdate && {
      suspend: {
        label: UI_LICENSE_ACTION_SUSPEND,
        mutation: {
          mutateAsync: async (payload) => {
            const result = await suspendMutation.mutateAsync(payload)
            onCompleted?.()
            return result
          },
          isPending: suspendMutation.isPending,
        },
        buildPayload: () => licenseId,
        disabled: licenseStatus === 'SUSPENDED',
      },
      resume: {
        label: UI_LICENSE_ACTION_RESUME,
        mutation: {
          mutateAsync: async (payload) => {
            const result = await resumeMutation.mutateAsync(payload)
            onCompleted?.()
            return result
          },
          isPending: resumeMutation.isPending,
        },
        buildPayload: () => licenseId,
        disabled: licenseStatus !== 'SUSPENDED',
      },
    }),
  })

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel}
    />
  )
}


