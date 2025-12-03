import type { Client, LicenseStatus } from '@simple-license/react-sdk'
import {
  useResumeLicense,
  useRevokeLicense,
  useSuspendLicense,
} from '@simple-license/react-sdk'
import type { ReactNode } from 'react'

import { ActionMenu } from '../data/ActionMenu'
import type { UiCommonProps } from '../types'
import { createCrudActions } from '../actions/mutationActions'
import { adaptMutation } from '../actions/mutationAdapter'

type LicenseRowActionsProps = UiCommonProps & {
  client: Client
  licenseId: string
  licenseStatus: LicenseStatus
  onCompleted?: () => void
  buttonLabel?: ReactNode
}

export function LicenseRowActions({
  client,
  licenseId,
  licenseStatus,
  onCompleted,
  buttonLabel,
  ...rest
}: LicenseRowActionsProps) {
  const revokeMutation = adaptMutation(useRevokeLicense(client))
  const suspendMutation = adaptMutation(useSuspendLicense(client))
  const resumeMutation = adaptMutation(useResumeLicense(client))

  const actions = createCrudActions<string>('License', {
    delete: {
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
    suspend: {
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
  })

  return (
    <ActionMenu
      {...rest}
      items={actions}
      buttonLabel={buttonLabel}
    />
  )
}


